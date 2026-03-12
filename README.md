# Online Exam Registration Platform

A complete, production-style online exam registration platform with separate user and admin systems.

## Features

### User System
- User registration and authentication
- Profile management
- Browse and register for available exams
- Application status tracking (Draft → Submitted → Under Review → Approved/Rejected)
- Correction requests for rejected applications
- Secure JWT-based authentication

### Admin System
- Admin dashboard with metrics
- Exam CRUD operations
- Application review and approval/rejection
- User management
- Audit logs for all admin actions
- CSV export functionality

## Tech Stack

### Backend
- **Python Flask** - Web framework
- **SQLAlchemy** - ORM
- **Flask-JWT-Extended** - JWT authentication
- **Flask-Migrate** - Database migrations
- **PostgreSQL/SQLite** - Database

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client

## Project Structure

```
/
├── backend/
│   ├── app/
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utilities
│   │   └── config/          # Configuration
│   ├── run.py               # Application entry point
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables
├── frontend/
│   ├── src/
│   │   ├── pages/           # React pages
│   │   ├── components/      # Reusable components
│   │   ├── services/        # API services
│   │   └── routes/          # Route definitions
│   ├── package.json         # Node dependencies
│   └── vite.config.js       # Vite configuration
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   - Copy `.env` file and update database URL if needed
   - Default uses SQLite for development

5. Run database migrations:
   ```bash
   python -c "from app import create_app; app = create_app(); app.app_context().push(); from app.models.models import db; db.create_all()"
   ```

6. Seed admin user:
   ```bash
   python seed.py
   ```

7. Run the backend server:
   ```bash
   python run.py
   ```

   The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

## Usage

### Admin Login
- **Email:** admin@example.com
- **Password:** admin123

### API Endpoints

#### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User/Admin login
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - Logout

#### User Endpoints
- `GET /user/dashboard` - User dashboard
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile
- `GET /user/exams` - List available exams
- `POST /user/exams/{exam_id}/register` - Register for exam
- `GET /user/registrations/{id}` - Get registration details
- `PUT /user/registrations/{id}` - Submit registration
- `POST /user/registrations/{id}/corrections` - Request correction

#### Admin Endpoints
- `GET /admin/dashboard` - Admin dashboard stats
- `GET /admin/exams` - List all exams
- `POST /admin/exams` - Create new exam
- `PUT /admin/exams/{id}` - Update exam
- `DELETE /admin/exams/{id}` - Delete exam
- `GET /admin/registrations` - List all registrations
- `PUT /admin/registrations/{id}/review` - Review registration
- `GET /admin/users` - List all users
- `PUT /admin/users/{id}/status` - Enable/disable user
- `GET /admin/audit-logs` - View audit logs
- `GET /admin/export` - Export data to CSV

## Security Features

- Password hashing with bcrypt
- JWT-based authentication with refresh tokens
- Role-based access control (USER/ADMIN)
- Input validation and sanitization
- SQL injection prevention via SQLAlchemy
- CORS protection
- Audit logging for admin actions

## Database Schema

### Core Tables
- **users** - User accounts with roles
- **exams** - Exam definitions
- **registrations** - User exam registrations
- **payments** - Payment records
- **corrections** - Application corrections
- **audit_logs** - Admin action logs

All tables include proper foreign keys, constraints, and timestamps.

## Development Notes

- The application enforces strict validation at the backend level
- Frontend includes inline validation and error handling
- Admin routes are protected with role-based access
- Database migrations are handled via Flask-Migrate
- The application is designed to be easily deployable to production

## License

This project is for educational purposes.
