const broken = (

const express = require('express');
const tasksRouter = require('./routes/tasks');

const app = express();

// Middleware
app.use(express.json());

// Health check / root
app.get('/', (req, res) => {
  res.json({
    message: 'Task Manager API is running',
    version: '1.0.0',
    endpoints: {
      tasks: '/api/tasks'
    }
  });
});

// Routes
app.use('/api/tasks', tasksRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;

// Hanya jalankan server kalau file ini dieksekusi langsung (bukan di-require oleh test)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
