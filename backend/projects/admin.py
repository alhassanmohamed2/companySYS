from django.contrib import admin
from .models import Project, Task, AssetLink, Notification

admin.site.register(Project)
admin.site.register(Task)
admin.site.register(AssetLink)
admin.site.register(Notification)
