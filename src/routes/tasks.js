const express = require('express');
const router = express.Router();

// In-memory storage
let tasks = [];
let nextId = 1;

// ─── GET /api/tasks ──────────────────────────────────────
// Mengembalikan semua task
router.get('/', (req, res) => {
  res.json({ data: tasks, total: tasks.length });
});

// ─── GET /api/tasks/:id ──────────────────────────────────
// Mengembalikan satu task berdasarkan id
router.get('/:id', (req, res) => {
  const task = tasks.find((t) => t.id === parseInt(req.params.id));
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json({ data: task });
});

// ─── POST /api/tasks ─────────────────────────────────────
// Membuat task baru
router.post('/', (req, res) => {
  const { title, description } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const task = {
    id: nextId++,
    title: title.trim(),
    description: description ? description.trim() : '',
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.push(task);
  res.status(201).json({ data: task });
});

// ─── PATCH /api/tasks/:id ────────────────────────────────
// Mengupdate task (partial update)
router.patch('/:id', (req, res) => {
  const task = tasks.find((t) => t.id === parseInt(req.params.id));
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { title, description, completed } = req.body;
  if (title !== undefined) task.title = title.trim();
  if (description !== undefined) task.description = description.trim();
  if (completed !== undefined) task.completed = Boolean(completed);

  res.json({ data: task });
});

// ─── DELETE /api/tasks/:id ───────────────────────────────
// Menghapus task
router.delete('/:id', (req, res) => {
  const index = tasks.findIndex((t) => t.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  tasks.splice(index, 1);
  res.status(204).send();
});

// Reset state (digunakan oleh unit test supaya tiap test bersih)
router.resetTasks = () => {
  tasks = [];
  nextId = 1;
};

module.exports = router;
