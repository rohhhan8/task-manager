const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    reminder: {
      type: Date,
      required: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    notified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Middleware to ensure the reminder is always stored as Date (UTC)
taskSchema.pre("save", function (next) {
  if (this.reminder) {
    this.reminder = new Date(this.reminder); // ensure Date object
  }
  next();
});

module.exports = mongoose.model("Task", taskSchema);
