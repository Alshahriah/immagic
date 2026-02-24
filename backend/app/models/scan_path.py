from tortoise import fields, models

class ScanPath(models.Model):
    id = fields.IntField(pk=True)
    path = fields.CharField(max_length=1024, unique=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    
    # Optional: Relationship to images found in this path could be complex 
    # if paths overlap. For simplicity, we just store the path configuration.

    class Meta:
        table = "scan_paths"

    def __str__(self):
        return self.path
