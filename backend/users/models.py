from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'System Admin'
        CEO = 'CEO', 'CEO'
        PM = 'PM', 'Project Manager'
        DEVELOPER = 'DEV', 'Developer'

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.DEVELOPER,
    )

    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"
