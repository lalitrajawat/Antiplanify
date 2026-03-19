# 🗂️ AntiPlanify

**AntiPlanify** is a full-stack project management web application built with the MERN stack. It helps developers and students plan, track, and manage their projects with AI-powered assistance, a Kanban board, Gantt chart, task calendar, and real-time notifications.

---

## 🚀 Live Demo

> _Deploy links will be added after deployment to Vercel (frontend) and Render (backend)._

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Authentication | Register, Login, Forgot/Reset Password with email |
| 📁 Project Management | Create, Edit, Delete, Pin projects |
| ✅ Task Management | Create tasks with status (Todo / Doing / Done), priority, and date range |
| 📊 Kanban Board | Drag-and-drop tasks between columns using `react-beautiful-dnd` |
| 📅 Gantt Chart | Visualise task timelines with `gantt-task-react` |
| 🗓️ Calendar View | See tasks plotted by start/end date |
| 🤖 AI Chat Assistant | Planify AI powered by Groq/Llama3 — project-aware, replies in Hinglish |
| 🔔 Notifications | Bell icon dropdown with real-time project & task notifications |
| 🔍 Project Search | Search projects by title from the Navbar |
| 📈 Progress Tracking | Automatic progress % from task completion ratio |
| 📧 Email Alerts | Welcome email on signup, project created email, password reset email |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite**
- **React Router v6**
- **Lucide React** (icons)
- **react-beautiful-dnd** (Kanban drag-and-drop)
- **gantt-task-react** (Gantt chart)
- **date-fns** (date formatting)
- **Vanilla CSS** (custom design system)

### Backend
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** (authentication)
- **bcryptjs** (password hashing)
- **Nodemailer** (email service)
- **Groq SDK** (AI chat via Llama3-8b)

---

## 📁 Project Structure

```
AntiPlanify/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── components/      # Navbar, ChatbotWidget
│       ├── pages/           # Home, Projects, ProjectDetail, Calendar, Profile, ...
│       ├── context/         # AuthContext
│       ├── hooks/           # useAuth
│       └── utils/           # api.js (Axios instance)
└── server/                  # Express backend
    ├── controllers/         # authController, projectController, taskController, ...
    ├── middleware/          # authMiddleware (JWT protect)
    ├── models/              # User, Project, Task, Notification
    ├── routes/              # authRoutes, projectRoutes, taskRoutes, chatRoutes, notificationRoutes
    └── utils/               # emailService
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (Atlas or local)
- A Groq API key (free at [console.groq.com](https://console.groq.com))
- An email account with SMTP access (e.g. Gmail App Password)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/AntiPlanify.git
cd AntiPlanify
```

### 2. Set up the Backend

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/antiplanify
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:5173
```

Start the backend server:

```bash
node index.js
# Server runs on http://localhost:5000
```

### 3. Set up the Frontend

```bash
cd client
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🔌 API Documentation

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get logged-in user info |
| POST | `/api/auth/forgot-password` | Send password reset email |
| PUT | `/api/auth/reset-password/:token` | Reset password with token |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all user projects (supports `?search=`) |
| POST | `/api/projects` | Create a new project |
| GET | `/api/projects/:id` | Get single project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project & its tasks |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/today` | Get tasks due today |
| GET | `/api/tasks/project/:projectId` | Get tasks for a project |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update task (triggers notification if done) |
| DELETE | `/api/tasks/:id` | Delete a task |

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user notifications (latest 20) |
| PUT | `/api/notifications/:id` | Mark notification as read |

### AI Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Chat with Planify AI (accepts `message` + optional `projectContext`) |

---

## 🚢 Deployment

| Service | Platform | Notes |
|---------|----------|-------|
| Frontend | [Vercel](https://vercel.com) | Connect GitHub repo, set root to `client/` |
| Backend | [Render](https://render.com) | Create Web Service, set root to `server/`, add all `.env` variables |
| Database | [MongoDB Atlas](https://cloud.mongodb.com) | Free M0 cluster, whitelist all IPs (0.0.0.0/0) |

---

## 🧪 Future Improvements

- [ ] Real-time updates with Socket.io
- [ ] Team collaboration & shared projects
- [ ] AI deadline prediction
- [ ] Dark / Light mode toggle
- [ ] Activity timeline
- [ ] Mobile app (React Native)

---

## 📸 Screenshots

> Screenshots will be added from the `/screenshots` directory.

---

## 👤 Author

Built by **Lalit Rajawat** — Academic project for MCA / BCA program.

---

## 📄 License

This project is for educational purposes only.
