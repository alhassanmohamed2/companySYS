from celery import shared_task
from .models import Notification
from users.models import User

@shared_task
def send_task_notification(user_id, message):
    try:
        user = User.objects.get(id=user_id)
        Notification.objects.create(user=user, message=message)
        # Ideally, we would also trigger a WebSocket event or send an email here.
        return f"Notification created for {user.username}"
    except User.DoesNotExist:
        return "User not found"

@shared_task
def send_email_reminder(user_id, task_title, due_date):
    try:
        user = User.objects.get(id=user_id)
        # In a real app, use django.core.mail.send_mail
        print(f"Sending email warning to {user.email}: Task '{task_title}' is due by {due_date}!")
        return f"Email sent to {user.email}"
    except User.DoesNotExist:
        return "User not found"
