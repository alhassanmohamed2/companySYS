from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Project(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    pm = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='managed_projects', limit_choices_to={'role': 'PM'})
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Task(models.Model):
    class Status(models.TextChoices):
        TODO = 'TODO', 'To-Do'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        REVIEW = 'REVIEW', 'Review'
        DONE = 'DONE', 'Done'

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='assigned_tasks', limit_choices_to={'role': 'DEV'})
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.TODO)
    sprint = models.CharField(max_length=100, blank=True)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    github_pr_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.project.name} - {self.title}"

class AssetLink(models.Model):
    class AssetType(models.TextChoices):
        GITHUB = 'GITHUB', 'GitHub Repository'
        GDRIVE = 'GDRIVE', 'Google Drive'
        DOC = 'DOC', 'Document Upload'

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='assets')
    asset_type = models.CharField(max_length=20, choices=AssetType.choices)
    url = models.URLField()
    description = models.CharField(max_length=255, blank=True)
    uploaded_file = models.FileField(upload_to='project_assets/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.project.name} - {self.get_asset_type_display()}"

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username} - Read: {self.is_read}"
