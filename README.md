# AntiPlanify

AntiPlanify is a modern, full-stack project management application designed to boost productivity with robust task tracking, interactive Kanban boards, and an integrated AI assistant.

## Features

- **User Authentication**: Secure signup, login, and robust password reset functionality via email.
- **Projects Dashboard**: Get an overview of your projects, including task completion progress and deadlines.
- **Interactive Kanban Board**: Drag and drop tasks between Todo, In Progress, and Completed columns for efficient workflow management.
- **Dynamic Calendar View**: View tasks aligned with their specific deadlines in a dynamic monthly calendar layout (Project-specific and Global).
- **AI Chat Assistant**: Need help planning or prioritizing? The built-in AI assistant has full context of your current project and tasks to offer personalized advice.
- **Real-Time Notification System**: Stay updated with a notification bell that alerts you to important events, such as newly created projects and completed tasks.
- **Project Management**: Enhanced Project Dashboard with search, pinning, editing, and deletion capabilities.

## Tech Stack

**Frontend**:
- React.js (Vite)
- React Router DOM
- Date-fns (Date formatting/manipulation)
- Lucide React (Icons)
- Vanilla CSS with CSS Variables for consistent theming

**Backend**:
- Node.js & Express
- MongoDB (Mongoose ORM)
- JSON Web Tokens (JWT) for Authentication
- Bcryptjs for password hashing
- Nodemailer for email services

**AI Integration**:
- Groq API for lightning fast, context-aware AI chat

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/antiplanify.git
   cd antiplanify
   ```

2. **Install Server Dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Variables:**
   Create a `.env` file in the `server` directory configuration:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=http://localhost:5173
   
   # Groq API for AI
   GROQ_API_KEY=your_groq_api_key
   
   # SMTP details for emails
   SMTP_HOST=smtp.yourprovider.com
   SMTP_PORT=587
   SMTP_USER=your_email@domain.com
   SMTP_PASS=your_app_password
   FROM_EMAIL=your_email@domain.com
   ```

## Running the App Globally

You can run the application servers concurrently or separately:

**Start the Server:**
```bash
cd server
npm run dev
```

**Start the Client:**
```bash
cd client
npm run dev
```

## Production Deployment

The backend `index.js` is equipped to serve the finalized frontend build. 
1. Run `npm run build` inside the `/client` directory.
2. Ensure `NODE_ENV=production` is set in your server environment.
3. Start the node server `node index.js`.

## Screenshots

*(Add your screenshots here)*

- ![Dashboard Demo](/screenshots/dashboard.png)
- ![Project Details & Kanban](/screenshots/kanban.png)
- ![AI Chat Integration](/screenshots/aichat.png)

## License

MIT License
