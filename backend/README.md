# LMS Backend

Django Rest Framework backend for the Learning Management System.

## Quick Start

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

3. Create superuser (optional):
```bash
python manage.py createsuperuser
```

4. Run server:
```bash
python manage.py runserver
```

## Models

- **User**: Custom user model with role (student/instructor)
- **Course**: Courses created by instructors
- **Chapter**: Chapters within courses with Plate.js JSON content
- **Enrollment**: Student enrollments in courses

## Authentication

Uses JWT (JSON Web Tokens) via `djangorestframework-simplejwt`.

## API Documentation

See main README.md for API endpoint documentation.

