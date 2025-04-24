import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [task, setTask] = useState("");
  const [reminder, setReminder] = useState("");
  const [tasks, setTasks] = useState([]);
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [userData, setUserData] = useState(null);
  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    if (token) {
      fetchTasks();
      fetchUserData();
    }
  }, [token]);

  const fetchUserData = async () => {
    try {
      const res = await axios.get("/api/auth/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(res.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/auth/register", {
        username,
        email,
        password,
      });
      alert("Signup successful! Please login.");
      setIsSignup(false);
    } catch (error) {
      alert("Signup failed");
      console.error(error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/login", {
        loginInput: identifier,
        password,
      });
      setToken(res.data.token);
    } catch (error) {
      alert("Login failed");
      console.error(error);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get("/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task.trim()) return;
  
    try {
      const taskData = { title: task, description: task };
  
      if (reminder) {
        // Convert reminder to UTC format
        const localReminder = new Date(reminder);
        const utcReminder = new Date(localReminder.getTime() - localReminder.getTimezoneOffset() * 60000);
        taskData.reminder = utcReminder.toISOString();
      }
  
      const res = await axios.post("/api/tasks", taskData, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setTasks([...tasks, res.data]);
      setTask("");
      setReminder("");
    } catch (error) {
      console.error(
        "Error adding task:",
        error.response ? error.response.data : error.message
      );
      alert("Error adding task. Check the console for details.");
    }
  };
  

  const handleDelete = async (id) => {
    try {
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? { ...t, deleted: true } : t))
      );

      setTimeout(async () => {
        await axios.delete(`/api/tasks/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks((prev) => prev.filter((item) => item._id !== id));
      }, 500);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="container">
      {!token ? (
        <div className="auth-container">
          <div className="auth-box">
            <h1>{isSignup ? "Sign Up" : "Login"}</h1>
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
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </>
              ) : (
                <input
                  type="text"
                  placeholder="Username or Email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              )}
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit">{isSignup ? "Sign Up" : "Login"}</button>
              <p>
                {isSignup
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsSignup(!isSignup)}
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
              onClick={() => {
                setToken("");
                setTasks([]);
                setTask("");
                setReminder("");
                setIdentifier("");
                setPassword("");
              }}
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
                placeholder="Enter task"
                required
              />
              <label style={{ margin: "0 10px" }}>Set Reminder:</label>
              <input
                type="datetime-local"
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
              />
              <button type="submit">Add Task</button>
            </form>

            <section className="task-list">
              <h3>Your Tasks</h3>
              <ul>
                {tasks.map((item) => (
                  <li
                    key={item._id}
                    className={item.deleted ? "deleted" : ""}
                  >
                    <strong>{item.title}</strong>
                    <br />
                    <small>
                      Created:{" "}
                      {new Date(item.createdAt).toLocaleString()}
                    </small>
                    <br />
                    {item.reminder && (
                      <small>
                        Reminder:{" "}
                        {new Date(item.reminder).toLocaleString()}
                      </small>
                    )}
                    <br />
                    <button onClick={() => handleDelete(item._id)}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
