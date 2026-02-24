from tortoise import fields, models

class Tag(models.Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=50, unique=True)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "tags"

    def __str__(self):
        return self.name
