# Task Manager Pro

A modern task management application with JWT authentication, email reminders, and a sleek UI.

## Features

- User authentication (signup/login) with JWT
- Create, view, and delete tasks
- Set reminders for tasks with email notifications
- Modern, responsive UI with monochromatic color scheme
- Proper timezone handling for reminders

## Tech Stack

### Frontend
- React
- CSS with modern styling
- Axios for API requests
- date-fns for date formatting

### Backend
- Node.js with Express
- MongoDB for database
- JWT for authentication
- Nodemailer for email notifications
- Node-cron for scheduling reminders

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   MONGO_URI=mongodb://localhost:27017/taskmanager
   JWT_SECRET=your_jwt_secret_key_here
   GMAIL_USER=your_email@gmail.com
   GMAIL_PASSWORD=your_app_password
   PORT=5000
   ```
   Note: For Gmail, you'll need to use an App Password if you have 2FA enabled.

4. Start the backend server:
   ```
   npm start
   ```
   Or for development with auto-reload:
   ```
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the frontend development server:
   ```
   npm start
   ```

4. The application should now be running at http://localhost:3000

## Usage

1. Register a new account or login with existing credentials
2. Add tasks with optional reminders
3. View your tasks in the dashboard
4. Delete tasks when completed

## Troubleshooting

- If you encounter MongoDB connection issues, make sure MongoDB is running locally or check your MongoDB Atlas credentials
- For email notification issues, verify your Gmail credentials and ensure less secure app access is enabled or use an App Password