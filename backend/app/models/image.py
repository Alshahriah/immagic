from tortoise import fields, models

class Image(models.Model):
    id = fields.IntField(pk=True)
    filename = fields.CharField(max_length=255)
    path = fields.CharField(max_length=1024, unique=True)
    file_size = fields.BigIntField()
    width = fields.IntField(null=True)
    height = fields.IntField(null=True)
    mime_type = fields.CharField(max_length=100, null=True)
    
    # Checksum for duplicate detection
    file_hash = fields.CharField(max_length=64, index=True)
    
    # OCR Data
    ocr_text = fields.TextField(null=True)
    ocr_processed = fields.BooleanField(default=False)
    
    # Thumbnail
    thumbnail_path = fields.CharField(max_length=1024, null=True)
    
    # Relationships
    tags = fields.ManyToManyField("models.Tag", related_name="images", through="image_tags")
    
    created_at = fields.DatetimeField(auto_now_add=True)
    modified_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "images"
        # We'll use specific indexes for search later, 
        # but Tortoise handles basic indexing well.

    def __str__(self):
        return self.filename
