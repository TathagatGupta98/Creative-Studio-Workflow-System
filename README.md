# Creative Studio Workflow System

A high-impact, professional workflow management platform designed for creative studios to manage projects like posters, videos, campaigns, and content workflows. Built with a focus on **Neo-Brutalist** design principles, this system provides a tactile, energetic, and highly functional experience for creative teams.

## 🚀 Overview

The Creative Studio Workflow System allows multiple studios to operate in isolated environments. It features a robust Role-Based Access Control (RBAC) system, ensuring that members—from Designers to Studio Admins—have the appropriate level of access to projects and tasks.

## 🛠️ Tech Stack

### Backend

- **Framework:** Django 6.0 + Django REST Framework (DRF)
- **Authentication:** JWT (SimpleJWT)
- **Database:** SQLite (Development) / PostgreSQL (Production ready)
- **Features:** django-filter for advanced querying, Django CORS headers.

### Frontend

- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS (v4) with Neo-Brutalist Design System
- **Icons:** Lucide React
- **Routing:** React Router 7
- **API Client:** Axios

## ✨ Core Features

- **Multi-Studio Isolation:** Complete data separation between different creative studios.
- **Role-Based Access Control (RBAC):**
  - **Studio Admin:** Full control over the studio, members, and projects.
  - **Project Lead:** Manage specific projects and assign tasks.
  - **Designer / Writer:** Execute tasks and update progress.
  - **Reviewer:** Provide feedback and approve/reject work items.
  - **Client Viewer:** Restricted view-only access to track progress.
- **Task Management:** Create, assign, and track tasks with deadlines, priorities, and tags.
- **Workflow Pipeline:** Standardized stages: `Draft` ➔ `Review` ➔ `Revision` ➔ `Approved` ➔ `Completed`.
- **Feedback Loops:** Comment threads on individual tasks for seamless team communication.
- **Search & Filtering:** Powerful filtering for tasks and projects using `django-filter`.
- **Notifications:** Stay updated on assignments, mentions, and status changes.

## 🎨 Design Philosophy: Neo-Brutalism

This platform rejects the sanitized "SaaS" look in favor of **Neo-Brutality**.

- **Bold Typography:** Montserrat for high-impact headlines and Hanken Grotesk for legibility.
- **Tactile UI:** Hard shadows (no blurs), thick black borders (2px-4px), and geometric shapes.
- **Vibrant Palette:** High-saturation primary colors (Yellow, Blue, Red, Mint) set against an off-white surface.
- **High Contrast:** prioritizing clarity and urgency in the creative workflow.

## 📂 Project Structure

```text
.
├── backend/            # Django REST Framework API
│   ├── core/           # Project settings and configuration
│   ├── projects/       # Project & Task management logic
│   └── users/          # User profiles, Studio isolation, and RBAC
├── frontend/           # React + Vite application
│   ├── src/
│   │   ├── api/        # Axios configuration
│   │   ├── components/ # Reusable UI components (Modals, Layouts, etc.)
│   │   ├── context/    # Auth and Global State
│   │   └── pages/      # Dashboard, Projects, Tasks, Login
└── requirements.txt    # Python dependencies
```

## ⚙️ Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r ../requirements.txt
   ```

4. Run migrations:

   ```bash
   python manage.py migrate
   ```

5. Start the development server:

   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the Vite development server:

   ```bash
   npm run dev
   ```

### video link

gdrive_link - <https://drive.google.com/drive/folders/10cSDu7fBWRnqDsAnYVL_9e7t2yAKGkvQ?usp=share_link>

## 📝 License

This project is developed as part of the Creative Studio Workflow assignment.
