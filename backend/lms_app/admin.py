from django.contrib import admin
from .models import User, Course, Chapter, Enrollment


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'username', 'role', 'is_active']
    list_filter = ['role', 'is_active']
    search_fields = ['email', 'username']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'instructor', 'created_at']
    list_filter = ['created_at']
    search_fields = ['title', 'description']


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'visibility', 'order']
    list_filter = ['visibility', 'created_at']
    search_fields = ['title']


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'enrolled_at']
    list_filter = ['enrolled_at']
    search_fields = ['student__email', 'course__title']

