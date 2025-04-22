// src/components/TaskForm.js
import React, { useState } from 'react';
import { createTask } from '../services/api';

const TaskForm = ({ onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTask = { title, description };

    createTask(newTask)
      .then((response) => {
        onTaskCreated(response.data);
        setTitle('');
        setDescription('');
      })
      .catch((error) => {
        console.error("Error creating task", error);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Task Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <button type="submit">Create Task</button>
    </form>
  );
};

export default TaskForm;
