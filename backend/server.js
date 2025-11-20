require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// uploads directory
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
app.use('/uploads', express.static(UPLOAD_DIR));

// multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + '-' + Math.round(Math.random()*1e9);
    cb(null, `${unique}${ext}`);
  }
});
const upload = multer({ storage });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});


app.get('/api/health', (req, res) => res.json({ ok: true }));


// GET single employee by id
app.get('/api/employees/:id', async (req, res) => {
  try {
    const empId = req.params.id;
    if (!empId) return res.status(400).json({ error: 'id required' });

    const [rows] = await pool.query(
      `SELECT id, name, department, designation, project, type, status, image_path, created_at
       FROM employees
       WHERE id = ?
       LIMIT 1`,
      [empId]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Employee not found' });

    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/employees/:id ERROR:', err);
    res.status(500).json({ error: 'DB error' });
  }
});


// GET employees
app.get('/api/employees', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, department, designation, project, type, status, image_path FROM employees ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// CREATE employee (supports image)
app.post('/api/employees', upload.single('image'), async (req, res) => {
  try {
    const { id, name, department, designation, project, type, status } = req.body;
    if (!id || !name) return res.status(400).json({ error: 'id and name required' });

    const image_path = req.file ? `/uploads/${req.file.filename}` : null;

    await pool.query(
      `INSERT INTO employees (id, name, department, designation, project, type, status, image_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, department || null, designation || null, project || null, type || null, status || null, image_path]
    );

    res.status(201).json({ id, name, department, designation, project, type, status, image_path });
  // inside app.post('/api/employees', ...)
} catch (err) {
  console.error('INSERT ERROR:', err && err.code, err && err.message, err && err.sqlMessage, err);
  if (err && err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Employee with this id already exists' });
  res.status(500).json({ error: 'DB insert error' });
}

});

// UPDATE employee (supports image)
app.put('/api/employees/:id', upload.single('image'), async (req, res) => {
  try {
    const empId = req.params.id;
    const { name, department, designation, project, type, status } = req.body;

    // find current (to delete old image if new)
    const [curRows] = await pool.query('SELECT image_path FROM employees WHERE id = ?', [empId]);
    if (curRows.length === 0) return res.status(404).json({ error: 'Employee not found' });
    const oldImage = curRows[0].image_path;

    const image_path = req.file ? `/uploads/${req.file.filename}` : null;

    const fields = [];
    const params = [];
    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (department !== undefined) { fields.push('department = ?'); params.push(department || null); }
    if (designation !== undefined) { fields.push('designation = ?'); params.push(designation || null); }
    if (project !== undefined) { fields.push('project = ?'); params.push(project || null); }
    if (type !== undefined) { fields.push('type = ?'); params.push(type || null); }
    if (status !== undefined) { fields.push('status = ?'); params.push(status || null); }
    if (image_path !== null) { fields.push('image_path = ?'); params.push(image_path); }

    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

    params.push(empId);
    const sql = `UPDATE employees SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await pool.query(sql, params);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Employee not found' });

    // delete old image file if replaced
    if (image_path && oldImage) {
      const full = path.join(__dirname, oldImage.replace(/^\//, ''));
      fs.unlink(full, err => { if (err) console.warn('failed to delete old image', err); });
    }

    res.json({ updated: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB update error' });
  }
});

// DELETE employee
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const empId = req.params.id;
    const [rows] = await pool.query('SELECT image_path FROM employees WHERE id = ?', [empId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const imagePath = rows[0].image_path;

    const [result] = await pool.query('DELETE FROM employees WHERE id = ?', [empId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });

    if (imagePath) {
      const full = path.join(__dirname, imagePath.replace(/^\//, ''));
      fs.unlink(full, err => { if (err) console.warn('failed to delete image', err); });
    }

    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB delete error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

