import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { authAPI, tasksAPI } from "./services/api";
import "./App.css";

function App() {
  const [task, setTask] = useState("");
  const [reminder, setReminder] = useState("");
  const [tasks, setTasks] = useState([]);
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem('token') || "");
  const [userData, setUserData] = useState(null);
  const [isSignup, setIsSignup] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchTasks();
      fetchUserData();
      localStorage.setItem('token', token);
    }
  }, [token]);

  const fetchUserData = async () => {
    try {
      const res = await authAPI.getUser();
      setUserData(res.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (error.response && error.response.status === 401) {
        // Token expired or invalid
        handleLogout();
      }
    }
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError("");

    // Validate inputs
    if (!validateEmail(email)) {
      setSignupError("Please enter a valid email address");
      return;
    }

    if (!validatePassword(password)) {
      setSignupError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.register({
        username,
        email,
        password,
      });
      setIsLoading(false);
      setIsSignup(false);
      setEmail("");
      setUsername("");
      setPassword("");
      // Show success message
      alert("Signup successful! Please login with your new account.");
    } catch (error) {
      setIsLoading(false);
      if (error.response && error.response.data) {
        setSignupError(error.response.data.message || "Signup failed. Please try again.");
      } else {
        setSignupError("Signup failed. Please try again later.");
      }
      console.error(error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!identifier.trim() || !password.trim()) {
      setLoginError("Please enter both username/email and password");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authAPI.login({
        loginInput: identifier,
        password,
      });
      setIsLoading(false);
      setToken(res.data.token);
      setIdentifier("");
      setPassword("");
    } catch (error) {
      setIsLoading(false);
      if (error.response && error.response.data) {
        setLoginError(error.response.data.message || "Login failed. Please check your credentials.");
      } else {
        setLoginError("Login failed. Please try again later.");
      }
      console.error(error);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await tasksAPI.getTasks();
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      if (err.response && err.response.status === 401) {
        handleLogout();
      }
    }
  };

  // Fix for the 5-hour offset issue
  const adjustTimeZone = (dateTimeStr) => {
    if (!dateTimeStr) return "";

    // Create a date object in local time
    const localDate = new Date(dateTimeStr);

    // Format it to ISO string but keep it as local time
    // This prevents the automatic conversion to UTC
    return localDate.toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task.trim()) return;

    const taskData = { title: task, description: task };

    if (reminder) {
      taskData.reminder = adjustTimeZone(reminder);
    }

    try {
      setIsLoading(true);
      const res = await tasksAPI.createTask(taskData);
      setIsLoading(false);
      setTasks([...tasks, res.data]);
      setTask("");
      setReminder("");
    } catch (error) {
      setIsLoading(false);
      console.error("Error adding task:", error);
      alert("Error adding task. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    try {
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? { ...t, deleted: true } : t))
      );

      setTimeout(async () => {
        await tasksAPI.deleteTask(id);
        setTasks((prev) => prev.filter((item) => item._id !== id));
      }, 500);
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Error deleting task. Please try again.");
    }
  };

  const handleLogout = () => {
    setToken("");
    setTasks([]);
    setUserData(null);
    localStorage.removeItem('token');
  };

  // Improved date formatting with proper timezone handling
  const formatDateTime = (dateString) => {
    try {
      const timeZone = 'Asia/Kolkata';
      return formatInTimeZone(new Date(dateString), timeZone, 'dd/MM/yyyy HH:mm');
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  return (
    <div className="container">
      {!token ? (
        <div className="auth-container">
          <div className="auth-box">
            <h1>{isSignup ? "Create Account" : "Welcome Back"}</h1>
            <form onSubmit={isSignup ? handleSignup : handleLogin}>
              {isSignup ? (
                <>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  {signupError && <p className="error-message">{signupError}</p>}
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Username or Email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                  {loginError && <p className="error-message">{loginError}</p>}
                </>
              )}
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? "Processing..." : isSignup ? "Sign Up" : "Login"}
              </button>
              <p>
                {isSignup
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setLoginError("");
                    setSignupError("");
                  }}
                  className="switch-btn"
                >
                  {isSignup ? "Login" : "Sign Up"}
                </button>
              </p>
            </form>
          </div>
        </div>
      ) : (
        <div className="dashboard">
          <aside className="sidebar">
            <h3>Task Manager</h3>
            <p>
              Hello, <strong>{userData?.username || "User"}</strong>
            </p>
            <button
              onClick={handleLogout}
              className="logout-btn"
            >
              Logout
            </button>
          </aside>

          <main className="main-content">
            <section className="task-summary">
              <h2>Dashboard</h2>
              <p>Total Tasks: {tasks.length}</p>
              <p>With Reminder: {tasks.filter((t) => t.reminder).length}</p>
            </section>

            <form onSubmit={handleSubmit} className="task-form">
              <input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="What do you need to do?"
                required
              />
              <label>Set Reminder:</label>
              <input
                type="datetime-local"
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Task"}
              </button>
            </form>

            <section className="task-list">
              <h3>Your Tasks</h3>
              {tasks.length === 0 ? (
                <div className="empty-state">
                  <p>You don't have any tasks yet. Add your first task above!</p>
                </div>
              ) : (
                <ul>
                  {tasks.map((item) => (
                    <li key={item._id} className={item.deleted ? "deleted" : ""}>
                      <strong>{item.title}</strong>
                      <small>Created: {formatDateTime(item.createdAt)}</small>
                      {item.reminder && (
                        <small>Reminder: {formatDateTime(item.reminder)}</small>
                      )}
                      <button onClick={() => handleDelete(item._id)}>
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
