import asyncio
from app.worker import celery_app
from app.services.ocr import extract_text_from_image
from app.services.image_processing import generate_thumbnail
from app.services.scanner import scan_directory
from app.models.image import Image
from app.models.job import Job
from app.models.scan_path import ScanPath
from tortoise import Tortoise, run_async
from app.core.config import settings

# Initialize Tortoise for Worker context
async def init_tortoise():
    await Tortoise.init(
        db_url=settings.DATABASE_URL,
        modules={"models": ["app.models"]}
    )

@celery_app.task(name="scan_directory_task")
def scan_directory_task(directory: str):
    async def _scan():
        await init_tortoise()
        
        # Create Job record for Scanning Phase
        job = await Job.create(job_id=f"scan_{directory}", type="scan", status="processing", target_path=directory)
        
        new_images = []
        try:
            job.result = f"Starting scan of {directory}..."
            await job.save()
            
            files = scan_directory(directory)
            total_files = len(files)
            
            job.result = f"Found {total_files} files. Importing..."
            await job.save()
            
            # Phase 1: Store all images in DB
            for i, file_data in enumerate(files):
                exists = await Image.filter(path=file_data["path"]).exists()
                if not exists:
                    await Image.create(
                        filename=file_data["filename"],
                        path=file_data["path"],
                        file_size=file_data["size"],
                        file_hash="pending" 
                    )
                    new_images.append(file_data["filename"])
                
                # Update progress every 10 files
                if (i + 1) % 10 == 0:
                    job.result = f"Processed {i + 1}/{total_files} files. Added {len(new_images)} new."
                    await job.save()
            
            job.status = "completed"
            job.result = f"Scan complete. Added {len(new_images)} new images. Total scanned: {total_files}."
            await job.save()
            
        except Exception as e:
            job.status = "failed"
            job.error_message = str(e)
            await job.save()
        finally:
             await Tortoise.close_connections()

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
    loop.run_until_complete(_scan())

@celery_app.task(name="process_pending_ocr_task")
def process_pending_ocr_task():
    async def _process_batch():
        await init_tortoise()
        
        # Find pending images
        pending_images = await Image.filter(ocr_processed=False).all()
        total = len(pending_images)
        
        if total == 0:
            return

        job = await Job.create(job_id=f"ocr_batch_{total}", type="ocr_batch", status="processing")
        job.result = f"Starting OCR for {total} images..."
        await job.save()
        
        try:
            success_count = 0
            for i, image in enumerate(pending_images):
                try:
                    text = extract_text_from_image(image.path)
                    image.ocr_text = text
                    image.ocr_processed = True
                    await image.save()
                    success_count += 1
                except Exception as e:
                    print(f"Failed OCR for {image.id}: {e}")
                
                # Update progress
                if (i + 1) % 5 == 0:
                    job.result = f"OCR Progress: {i + 1}/{total}. Success: {success_count}."
                    await job.save()

            job.status = "completed"
            job.result = f"OCR Batch Complete. Processed {total} images. Success: {success_count}."
            await job.save()
            
        except Exception as e:
            job.status = "failed"
            job.error_message = str(e)
            await job.save()
        finally:
            await Tortoise.close_connections()

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
    loop.run_until_complete(_process_batch())

@celery_app.task(name="process_image_ocr")
def process_image_ocr(image_id: int, image_path: str):
    # Keep individual task for single re-runs if needed
    async def _ocr():
        await init_tortoise()
        try:
            # Check if job tracking exists or create one
            # Ideally we track this task too
            job_id = f"ocr_{image_id}"
            job = await Job.create(job_id=job_id, type="ocr", status="processing", target_path=image_path)

            try:
                text = extract_text_from_image(image_path)
                
                image = await Image.get(id=image_id)
                image.ocr_text = text
                image.ocr_processed = True
                await image.save()
                
                job.status = "completed"
                await job.save()
            except Exception as e:
                job.status = "failed"
                job.error_message = str(e)
                await job.save()

        finally:
            await Tortoise.close_connections()

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
    loop.run_until_complete(_ocr())

@celery_app.task(name="process_thumbnail")
def process_thumbnail(image_id: int, image_path: str, output_path: str):
    success = generate_thumbnail(image_path, output_path)
    return {"image_id": image_id, "success": success}
