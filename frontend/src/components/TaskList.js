// src/components/TaskList.js
import React, { useState, useEffect } from 'react';
import { getTasks, deleteTask } from '../services/api';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    getTasks()
      .then((response) => setTasks(response.data))
      .catch((error) => {
        console.error("Error fetching tasks", error);
      });
  }, []);

  const handleDelete = (taskId) => {
    deleteTask(taskId)
      .then(() => {
        setTasks(tasks.filter((task) => task._id !== taskId));
      })
      .catch((error) => {
        console.error("Error deleting task", error);
      });
  };

  return (
    <div>
      <h2>Task List</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task._id}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <button onClick={() => handleDelete(task._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
