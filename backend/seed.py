import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'company_sys_backend.settings')
django.setup()

from users.models import User

def seed_users():
    users = [
        {'username': 'admin', 'email': 'admin@demo.com', 'role': 'ADMIN', 'password': 'password123'},
        {'username': 'ceo', 'email': 'ceo@demo.com', 'role': 'CEO', 'password': 'password123'},
        {'username': 'pm1', 'email': 'pm1@demo.com', 'role': 'PM', 'password': 'password123'},
        {'username': 'dev1', 'email': 'dev1@demo.com', 'role': 'DEV', 'password': 'password123'},
    ]
    for u in users:
        if not User.objects.filter(username=u['username']).exists():
            user = User.objects.create_user(
                username=u['username'],
                email=u['email'],
                password=u['password'],
                role=u['role']
            )
            print(f"Created {u['role']} user: {user.username}")
        else:
            print(f"User {u['username']} already exists.")

if __name__ == '__main__':
    seed_users()
