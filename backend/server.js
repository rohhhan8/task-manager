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
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://task-manager-hd1x.onrender.com']
    : ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

const PORT = process.env.PORT || 5000;

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
