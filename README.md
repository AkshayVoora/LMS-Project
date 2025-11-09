# Learning Management System (LMS)

A fully functional Learning Management System built with Django Rest Framework (backend) and Next.js (frontend).

## Features

### Instructor Features
- Create and manage courses
- Create chapters within courses
- Use Plate.js rich text editor for chapter content
- Set chapter visibility as public or private

### Student Features
- View list of available courses
- Join courses
- View and read public chapters from joined courses

## Tech Stack

- **Backend**: Django 4.2, Django Rest Framework, JWT Authentication
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Editor**: Plate.js (rich text editor)

## Project Structure

```
Classavo/
├── backend/          # Django backend
│   ├── lms_project/  # Django project settings
│   └── lms_app/      # Main application
└── frontend/         # Next.js frontend
    ├── app/          # Next.js app directory
    ├── components/   # React components
    └── lib/          # Utilities and API client
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

5. Create a superuser (optional, for admin access):
```bash
python manage.py createsuperuser
```

6. Run the development server:
```bash
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file (optional, defaults to localhost:8000):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

4. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/register/` - Register a new user
- `POST /api/login/` - Login user
- `POST /api/token/refresh/` - Refresh JWT token

### Courses
- `GET /api/courses/` - List courses (filtered by role)
- `POST /api/courses/` - Create a course (instructor only)
- `GET /api/courses/{id}/` - Get course details
- `PUT /api/courses/{id}/` - Update course (instructor only)
- `POST /api/courses/{id}/join/` - Join a course (student only)
- `GET /api/courses/{id}/chapters/` - List chapters for a course

### Chapters
- `GET /api/chapters/` - List chapters (filtered by role and enrollment)
- `POST /api/chapters/` - Create a chapter (instructor only)
- `GET /api/chapters/{id}/` - Get chapter details
- `PUT /api/chapters/{id}/` - Update chapter (instructor only)
- `DELETE /api/chapters/{id}/` - Delete chapter (instructor only)

### Enrollments
- `GET /api/enrollments/` - List user enrollments (student only)

## Usage Flow

### Instructor Flow
1. Register/Login as an instructor
2. Create a course from the dashboard
3. Add chapters to the course with Plate.js editor
4. Set chapter visibility (public/private)

### Student Flow
1. Register/Login as a student
2. Browse available courses
3. Join courses
4. View public chapters from enrolled courses

## Development Notes

- The backend uses SQLite by default (changeable in settings.py)
- JWT tokens are stored in cookies on the frontend
- CORS is configured to allow requests from localhost:3000
- Plate.js content is stored as JSON in the database

## License

This project is open source and available for educational purposes.

