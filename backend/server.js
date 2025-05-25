require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
const path = require("path");
const Task = require("./models/TaskModel");
const nodemailer = require("nodemailer");

const app = express();

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      'https://task-manager-hd1x.onrender.com', // Your current Render frontend URL
      'https://your-frontend-url.vercel.app', // Update this after deploying to Vercel
      'https://task-manager-pro.vercel.app', // Alternative domain
      'https://task-manager-frontend.vercel.app', // Another option
    ]
  : ['http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

const PORT = process.env.PORT || 10000;

// MongoDB Connection with better error handling
const connectDB = async () => {
  try {
    console.log("🔄 Attempting to connect to MongoDB Atlas...");
    console.log("Connection string:", process.env.MONGO_URI.replace(/\/\/.*:.*@/, "//***:***@"));

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);

    // Provide specific error messages
    if (error.message.includes("authentication failed")) {
      console.error("🔐 Authentication failed. Please check:");
      console.error("   - Username and password are correct");
      console.error("   - User has proper database permissions");
      console.error("   - IP address is whitelisted in MongoDB Atlas");
    }

    if (error.message.includes("ENOTFOUND")) {
      console.error("🌐 Network error. Please check:");
      console.error("   - Internet connection");
      console.error("   - Cluster URL is correct");
    }

    process.exit(1);
  }
};

connectDB();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Root endpoint for when someone visits the main URL
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task Manager API</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 50px;
                background: linear-gradient(135deg, #4f46e5, #6366f1);
                color: white;
                margin: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
            }
            .container {
                background: rgba(255, 255, 255, 0.1);
                padding: 40px;
                border-radius: 20px;
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }
            h1 { margin-bottom: 20px; font-size: 2.5em; }
            p { font-size: 1.2em; margin-bottom: 20px; }
            .api-link {
                background: rgba(255, 255, 255, 0.2);
                padding: 15px 30px;
                border-radius: 10px;
                text-decoration: none;
                color: white;
                font-weight: bold;
                display: inline-block;
                transition: all 0.3s;
                margin: 10px;
            }
            .api-link:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
            }
            .status { margin-top: 30px; font-size: 0.9em; opacity: 0.8; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Task Manager API</h1>
            <p>Backend is running successfully!</p>
            <p>Database: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'}</p>
            <a href="/health" class="api-link">Health Check</a>
            <a href="/api/auth" class="api-link">Auth API</a>
            <a href="/api/tasks" class="api-link">Tasks API</a>
            <div class="status">
                <p>✅ Server Status: Active</p>
                <p>🔗 API Endpoints Available</p>
                <p>📊 Ready for Frontend Connection</p>
            </div>
        </div>
    </body>
    </html>
  `);
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));

// Email Transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  }
});

const sendReminderEmail = (task) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: task.userEmail,
    subject: `Task Reminder: ${task.title}`,
    text: `Hi! Just a reminder that your task "${task.title}" is due now. Please take action.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("📧 Email Error:", error);
    } else {
      console.log(`📨 Email sent: ${info.response}`);
    }
  });
};

// Cron: check every minute
cron.schedule("* * * * *", async () => {
  const now = new Date();
  console.log(`⏰ Cron job running at ${now.toISOString()}`);
  try {
    const upcomingTasks = await Task.find({
      reminder: { $lte: now },
      notified: { $ne: true },
    });

    for (const task of upcomingTasks) {
      console.log(`🔔 Sending reminder for task "${task.title}"`);
      await sendReminderEmail(task);
      task.notified = true;
      await task.save();
    }
  } catch (err) {
    console.error("🚨 Cron job error:", err);
  }
});

// Serve frontend
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend", "build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
  });
}

// Graceful Shutdown
process.on("SIGINT", () => {
  console.log("🛑 SIGINT received. Shutting down...");
  mongoose.connection.close(false, () => {
    console.log("📴 MongoDB connection closed.");
    process.exit(0);
  });
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
