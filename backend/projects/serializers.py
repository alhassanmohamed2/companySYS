from rest_framework import serializers
from .models import Project, Task, AssetLink, Notification
from users.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']

class TaskSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.DEVELOPER),
        source='assigned_to',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Task
        fields = '__all__'

class AssetLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetLink
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    pm = UserSerializer(read_only=True)
    pm_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.PM),
        source='pm',
        write_only=True,
        required=False,
        allow_null=True
    )
    tasks = TaskSerializer(many=True, read_only=True)
    assets = AssetLinkSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
