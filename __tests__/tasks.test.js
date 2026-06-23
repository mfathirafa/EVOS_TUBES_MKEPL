const request = require('supertest');
const app = require('../src/app');
const tasksRouter = require('../src/routes/tasks');

// Reset state sebelum tiap test agar tidak ada data sisa
beforeEach(() => {
  tasksRouter.resetTasks();
});

// ─── Root endpoint ────────────────────────────────────────
describe('GET /', () => {
  it('harus mengembalikan info API', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Task Manager API is running');
    expect(res.body.version).toBeDefined();
  });
});

// ─── GET semua tasks ──────────────────────────────────────
describe('GET /api/tasks', () => {
  it('harus mengembalikan array kosong saat tidak ada task', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.total).toBe(0);
  });

  it('harus mengembalikan semua task yang ada', async () => {
    await request(app).post('/api/tasks').send({ title: 'Task A' });
    await request(app).post('/api/tasks').send({ title: 'Task B' });
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.total).toBe(2);
  });
});

// ─── POST task baru ───────────────────────────────────────
describe('POST /api/tasks', () => {
  it('harus membuat task baru dengan sukses', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Belajar GitHub Actions', description: 'Setup CI/CD pipeline' });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Belajar GitHub Actions');
    expect(res.body.data.description).toBe('Setup CI/CD pipeline');
    expect(res.body.data.completed).toBe(false);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.createdAt).toBeDefined();
  });

  it('harus membuat task tanpa deskripsi', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Task tanpa deskripsi' });

    expect(res.status).toBe(201);
    expect(res.body.data.description).toBe('');
  });

  it('harus menolak task tanpa title (400)', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ description: 'Tidak ada title' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Title is required');
  });

  it('harus menolak task dengan title string kosong (400)', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Title is required');
  });
});

// ─── GET task by id ───────────────────────────────────────
describe('GET /api/tasks/:id', () => {
  it('harus mengembalikan task berdasarkan id', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Task X' });
    const id = created.body.data.id;

    const res = await request(app).get(`/api/tasks/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
    expect(res.body.data.title).toBe('Task X');
  });

  it('harus mengembalikan 404 jika task tidak ditemukan', async () => {
    const res = await request(app).get('/api/tasks/9999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Task not found');
  });
});

// ─── PATCH task ───────────────────────────────────────────
describe('PATCH /api/tasks/:id', () => {
  it('harus mengupdate title task', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Judul Lama' });
    const id = created.body.data.id;

    const res = await request(app)
      .patch(`/api/tasks/${id}`)
      .send({ title: 'Judul Baru' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Judul Baru');
  });

  it('harus mengupdate status completed', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Task selesai' });
    const id = created.body.data.id;

    const res = await request(app)
      .patch(`/api/tasks/${id}`)
      .send({ completed: true });

    expect(res.status).toBe(200);
    expect(res.body.data.completed).toBe(true);
  });

  it('harus mengembalikan 404 saat update task yang tidak ada', async () => {
    const res = await request(app)
      .patch('/api/tasks/9999')
      .send({ title: 'Tidak ada' });

    expect(res.status).toBe(404);
  });
});

// ─── DELETE task ──────────────────────────────────────────
describe('DELETE /api/tasks/:id', () => {
  it('harus menghapus task dan mengembalikan 204', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Hapus aku' });
    const id = created.body.data.id;

    const del = await request(app).delete(`/api/tasks/${id}`);
    expect(del.status).toBe(204);

    const check = await request(app).get(`/api/tasks/${id}`);
    expect(check.status).toBe(404);
  });

  it('harus mengembalikan 404 saat hapus task yang tidak ada', async () => {
    const res = await request(app).delete('/api/tasks/9999');
    expect(res.status).toBe(404);
  });
});

// ─── 404 handler ──────────────────────────────────────────
describe('Route tidak dikenal', () => {
  it('harus mengembalikan 404 untuk route yang tidak ada', async () => {
    const res = await request(app).get('/bukan-route');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Route not found');
  });
});

js
// SENGAJA VULNERABLE — untuk demo CodeQL
const { exec } = require('child_process');
router.get('/debug/run', (req, res) => {
  const cmd = req.query.cmd;
  exec(cmd, (err, stdout) => {   // CodeQL: OS Command Injection
    res.json({ output: stdout });
  });
});-