from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Project, Task, AssetLink, Notification, TaskComment, ActivityLog
from .serializers import ProjectSerializer, TaskSerializer, AssetLinkSerializer, NotificationSerializer, TaskCommentSerializer, ActivityLogSerializer
from .permissions import IsAdminUser, IsCEOUser, IsPMUser, IsDeveloperUser
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by('-created_at')
    serializer_class = ProjectSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['name', 'description']
    filterset_fields = ['pm', 'start_date', 'end_date']

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', None) == 'PM':
            return Project.objects.filter(pm=user)
        elif getattr(user, 'role', None) == 'DEV':
            return Project.objects.filter(tasks__assigned_to=user).distinct()
        return super().get_queryset()

    def perform_create(self, serializer):
        project = serializer.save()
        ActivityLog.objects.create(
            user=self.request.user,
            action=f"Created Project: {project.name}",
            target_type='Project',
            target_id=project.id
        )

    def perform_update(self, serializer):
        project = serializer.save()
        ActivityLog.objects.create(
            user=self.request.user,
            action=f"Updated Project: {project.name}",
            target_type='Project',
            target_id=project.id
        )

    def perform_destroy(self, instance):
        ActivityLog.objects.create(
            user=self.request.user,
            action=f"Deleted Project: {instance.name}",
            target_type='Project',
            target_id=instance.id
        )
        instance.delete()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['create', 'update', 'partial_update']:
            permission_classes = [IsAdminUser | IsPMUser]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by('-created_at')
    serializer_class = TaskSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['title', 'description', 'sprint']
    filterset_fields = ['project', 'assigned_to', 'status', 'sprint']

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', None) == 'PM':
            return Task.objects.filter(project__pm=user)
        elif getattr(user, 'role', None) == 'DEV':
            return Task.objects.filter(assigned_to=user)
        return super().get_queryset()

    def perform_create(self, serializer):
        task = serializer.save()
        ActivityLog.objects.create(
            user=self.request.user,
            action=f"Created Task: {task.title} under Project: {task.project.name}",
            target_type='Task',
            target_id=task.id
        )

    def perform_update(self, serializer):
        # Determine if status changed to mention it in the log
        old_status = serializer.instance.status if serializer.instance else None
        task = serializer.save()
        action_text = f"Updated Task: {task.title}"
        if old_status and old_status != task.status:
            action_text = f"Moved Task: {task.title} from {old_status} to {task.status}"
            
        ActivityLog.objects.create(
            user=self.request.user,
            action=action_text,
            target_type='Task',
            target_id=task.id
        )

    def perform_destroy(self, instance):
        ActivityLog.objects.create(
            user=self.request.user,
            action=f"Deleted Task: {instance.title}",
            target_type='Task',
            target_id=instance.id
        )
        instance.delete()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['create']:
            permission_classes = [IsAdminUser | IsPMUser]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [permissions.IsAuthenticated]
        elif self.action == 'destroy':
            permission_classes = [IsAdminUser | IsPMUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

class AssetLinkViewSet(viewsets.ModelViewSet):
    queryset = AssetLink.objects.all().order_by('-created_at')
    serializer_class = AssetLinkSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'asset_type']

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'notification marked as read'})

class TaskCommentViewSet(viewsets.ModelViewSet):
    queryset = TaskComment.objects.all().order_by('created_at')
    serializer_class = TaskCommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['task']

    def perform_create(self, serializer):
        comment = serializer.save(user=self.request.user)
        ActivityLog.objects.create(
            user=self.request.user,
            action=f"Commented on Task: {comment.task.title}",
            target_type='Task',
            target_id=comment.task.id
        )
        
class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActivityLog.objects.all().order_by('-created_at')
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['target_type', 'target_id', 'user']
