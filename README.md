# CompanySYS — Enterprise Project Management Platform

A full-stack project management system with **role-based dashboards**, **Kanban boards**, **GitHub integration**, and **real-time notifications**.

---

## 🚀 Tech Stack

| Layer       | Technology                                      |
|-------------|--------------------------------------------------|
| **Backend** | Python · Django 6 · Django REST Framework · JWT  |
| **Frontend**| React 19 · TypeScript · Tailwind CSS v4 · Vite   |
| **Database**| MySQL 8 (Docker) / SQLite (local dev)            |
| **Queue**   | Celery · Redis                                   |
| **Infra**   | Docker · Docker Compose                          |

---

## 👥 User Roles & Dashboards

| Role        | Username | Password      | Dashboard Features                                    |
|-------------|----------|---------------|------------------------------------------------------|
| **Admin**   | `admin`  | `password123` | System overview, user management, quick actions       |
| **CEO**     | `ceo`    | `password123` | KPI analytics, completion metrics, project summaries  |
| **PM**      | `pm1`    | `password123` | Create projects, manage tasks, sprint summaries       |
| **Developer**| `dev1`  | `password123` | Kanban board with drag-to-progress task workflow      |

---

## ⚡ Quick Start — Local Development

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate          # Linux/Mac
pip install -r requirements.txt
python manage.py migrate
python seed.py                    # Creates demo users
python manage.py runserver 0.0.0.0:8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** and log in with any demo account above.

---

## 🐳 Docker Setup

```bash
docker-compose up --build
```

Services started:
- **MySQL 8** on port `3306`
- **Redis** on port `6379`
- **Backend API** on port `8000`
- **Celery Worker** for background tasks
- **Frontend** on port `5173`

---

## 📁 Project Structure

```
companySYS/
├── backend/
│   ├── company_sys_backend/    # Django settings, URLs, WSGI/ASGI
│   ├── users/                  # Custom user model, JWT auth, user API
│   ├── projects/               # Projects, Tasks, Assets, Notifications
│   ├── seed.py                 # Demo data seeder
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── admin/          # Admin dashboard, user management
│   │   │   ├── ceo/            # CEO analytics dashboard
│   │   │   ├── pm/             # PM workspace & project creation
│   │   │   ├── dev/            # Developer Kanban board
│   │   │   ├── projects/       # Project detail with GitHub integration
│   │   │   ├── settings/       # Profile & password change
│   │   │   ├── notifications/  # Notification center
│   │   │   └── auth/           # Login page
│   │   ├── layouts/            # Dashboard sidebar layout
│   │   ├── services/           # Axios API client with JWT interceptors
│   │   └── store/              # Zustand auth state management
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

---

## 🔑 API Endpoints

### Authentication
| Method | Endpoint                  | Description            |
|--------|---------------------------|------------------------|
| POST   | `/api/token/`             | Login (returns JWT)    |
| POST   | `/api/token/refresh/`     | Refresh access token   |

### Users
| Method | Endpoint                        | Description         |
|--------|---------------------------------|---------------------|
| GET    | `/api/users/`                   | List all users      |
| POST   | `/api/users/`                   | Create user         |
| GET    | `/api/users/me/`                | Current user profile|
| PATCH  | `/api/users/me/`                | Update profile      |
| POST   | `/api/users/change-password/`   | Change password     |

### Projects & Tasks
| Method | Endpoint             | Description         |
|--------|----------------------|---------------------|
| GET    | `/api/projects/`     | List projects       |
| POST   | `/api/projects/`     | Create project      |
| GET    | `/api/tasks/`        | List tasks          |
| POST   | `/api/tasks/`        | Create task         |
| PATCH  | `/api/tasks/:id/`    | Update task status  |

### Assets (GitHub Integration)
| Method | Endpoint             | Description               |
|--------|----------------------|---------------------------|
| GET    | `/api/assets/`       | List linked assets        |
| POST   | `/api/assets/`       | Link GitHub repo / asset  |
| DELETE | `/api/assets/:id/`   | Remove linked asset       |

---

## ✨ Key Features

- **Role-Based Access Control** — Each role sees a tailored dashboard and sidebar
- **Kanban Board** — Developers progress tasks through To-Do → In Progress → Review → Done
- **GitHub Integration** — Link repos to projects with clickable external links
- **User Management** — Admin can create, edit, and delete users with role assignment
- **Password Change** — All users can change their password from Settings
- **JWT Authentication** — Secure token-based auth with automatic refresh
- **Dark Mode UI** — Glassmorphism design with smooth animations
- **Notifications** — In-app notification system with read/unread tracking

---

## 📄 License

MIT
