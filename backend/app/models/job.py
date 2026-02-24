from tortoise import fields, models

class Job(models.Model):
    class JobStatus:
        PENDING = "pending"
        PROCESSING = "processing"
        COMPLETED = "completed"
        FAILED = "failed"

    class JobType:
        OCR = "ocr"
        SCAN = "scan"
        THUMBNAIL = "thumbnail"

    id = fields.IntField(pk=True)
    job_id = fields.CharField(max_length=100, unique=True) # Celery Task ID
    type = fields.CharField(max_length=50) # ocr, scan, thumbnail
    status = fields.CharField(max_length=20, default=JobStatus.PENDING)
    
    target_path = fields.CharField(max_length=1024, null=True) # File being processed
    result = fields.TextField(null=True) # For logs/progress
    error_message = fields.TextField(null=True)
    
    created_at = fields.DatetimeField(auto_now_add=True)
    completed_at = fields.DatetimeField(null=True)

    class Meta:
        table = "jobs"

    def __str__(self):
        return f"{self.type} - {self.status}"
