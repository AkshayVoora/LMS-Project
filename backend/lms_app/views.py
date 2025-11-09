from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from .models import User, Course, Chapter, Enrollment
from .serializers import (
    UserSerializer, RegisterSerializer, CourseSerializer,
    ChapterSerializer, EnrollmentSerializer
)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response(
                {'error': 'Email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=email, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )


class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'instructor':
            return Course.objects.filter(instructor=user)
        elif user.role == 'student':
            return Course.objects.all()
        return Course.objects.none()
    
    def perform_create(self, serializer):
        if self.request.user.role != 'instructor':
            raise permissions.PermissionDenied("Only instructors can create courses")
        serializer.save(instructor=self.request.user)
    
    def perform_update(self, serializer):
        if self.request.user.role != 'instructor':
            raise permissions.PermissionDenied("Only instructors can update courses")
        if serializer.instance.instructor != self.request.user:
            raise permissions.PermissionDenied("You can only update your own courses")
        serializer.save()
    
    def perform_destroy(self, instance):
        if self.request.user.role != 'instructor':
            raise permissions.PermissionDenied("Only instructors can delete courses")
        if instance.instructor != self.request.user:
            raise permissions.PermissionDenied("You can only delete your own courses")
        instance.delete()
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]
    
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        user = request.user
        
        if user.role != 'student':
            return Response(
                {'error': 'Only students can join courses'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            course = Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return Response(
                {'error': 'Course not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        enrollment, created = Enrollment.objects.get_or_create(
            student=user,
            course=course
        )
        
        if created:
            return Response(
                {'message': 'Successfully joined the course'},
                status=status.HTTP_201_CREATED
            )
        return Response(
            {'message': 'Already enrolled in this course'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['get'])
    def chapters(self, request, pk=None):
        user = request.user
        
        try:
            course = Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return Response(
                {'error': 'Course not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if user.role == 'instructor':
            if course.instructor != user:
                return Response(
                    {'error': 'You do not have permission to view this course'},
                    status=status.HTTP_403_FORBIDDEN
                )
            chapters = course.chapters.all()
        elif user.role == 'student':
            is_enrolled = Enrollment.objects.filter(student=user, course=course).exists()
            if not is_enrolled:
                return Response(
                    {'error': 'You must enroll in this course first'},
                    status=status.HTTP_403_FORBIDDEN
                )
            chapters = course.chapters.filter(visibility='public')
        else:
            return Response(
                {'error': 'Invalid user role'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ChapterSerializer(chapters, many=True)
        return Response(serializer.data)


class ChapterViewSet(viewsets.ModelViewSet):
    serializer_class = ChapterSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'instructor':
            return Chapter.objects.filter(course__instructor=user)
        elif user.role == 'student':
            enrolled_courses = Enrollment.objects.filter(student=user).values_list('course_id', flat=True)
            return Chapter.objects.filter(
                course_id__in=enrolled_courses,
                visibility='public'
            )
        return Chapter.objects.none()
    
    def perform_create(self, serializer):
        if self.request.user.role != 'instructor':
            raise permissions.PermissionDenied("Only instructors can create chapters")
        course_id = self.request.data.get('course')
        course = get_object_or_404(Course, id=course_id)
        
        if course.instructor != self.request.user:
            raise permissions.PermissionDenied("You can only add chapters to your own courses")
        
        serializer.save(course=course)
    
    def perform_update(self, serializer):
        if self.request.user.role != 'instructor':
            raise permissions.PermissionDenied("Only instructors can update chapters")
        if serializer.instance.course.instructor != self.request.user:
            raise permissions.PermissionDenied("You can only update chapters in your own courses")
        serializer.save()
    
    def perform_destroy(self, instance):
        if self.request.user.role != 'instructor':
            raise permissions.PermissionDenied("Only instructors can delete chapters")
        if instance.course.instructor != self.request.user:
            raise permissions.PermissionDenied("You can only delete chapters from your own courses")
        instance.delete()
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]


class EnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Enrollment.objects.filter(student=user)
        return Enrollment.objects.none()

