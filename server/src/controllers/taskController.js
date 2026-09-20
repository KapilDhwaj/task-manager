const pool = require('../db');

// GET /api/tasks  — list all tasks for logged-in user
const getTasks = async (req, res) => {
  const { status, priority, search } = req.query;
  const userId = req.user.id;

  let query = 'SELECT * FROM tasks WHERE user_id = $1';
  const params = [userId];
  let paramIdx = 2;

  if (status) {
    query += ` AND status = $${paramIdx++}`;
    params.push(status);
  }
  if (priority) {
    query += ` AND priority = $${paramIdx++}`;
    params.push(priority);
  }
  if (search) {
    query += ` AND (title ILIKE $${paramIdx} OR description ILIKE $${paramIdx})`;
    params.push(`%${search}%`);
    paramIdx++;
  }
  query += ' ORDER BY created_at DESC';

  try {
    const result = await pool.query(query, params);
    res.json({ tasks: result.rows });
  } catch (err) {
    console.error('GetTasks error:', err);
    res.status(500).json({ message: 'Server error fetching tasks.' });
  }
};

// GET /api/tasks/:id
const getTaskById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    res.json({ task: result.rows[0] });
  } catch (err) {
    console.error('GetTaskById error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/tasks
const createTask = async (req, res) => {
  const { title, description, status, priority, due_date } = req.body;
  const userId = req.user.id;

  if (!title || title.trim() === '') {
    return res.status(400).json({ message: 'Task title is required.' });
  }

  const validStatuses  = ['todo', 'in-progress', 'done'];
  const validPriorities = ['low', 'medium', 'high'];

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({ message: 'Invalid priority value.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tasks (user_id, title, description, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        userId,
        title.trim(),
        description || null,
        status || 'todo',
        priority || 'medium',
        due_date || null,
      ]
    );
    res.status(201).json({ message: 'Task created!', task: result.rows[0] });
  } catch (err) {
    console.error('CreateTask error:', err);
    res.status(500).json({ message: 'Server error creating task.' });
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, due_date } = req.body;
  const userId = req.user.id;

  // Verify ownership
  const existing = await pool.query(
    'SELECT id FROM tasks WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  if (existing.rows.length === 0) {
    return res.status(404).json({ message: 'Task not found.' });
  }

  const validStatuses   = ['todo', 'in-progress', 'done'];
  const validPriorities = ['low', 'medium', 'high'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({ message: 'Invalid priority value.' });
  }

  try {
    const result = await pool.query(
      `UPDATE tasks
       SET title       = COALESCE($1, title),
           description = COALESCE($2, description),
           status      = COALESCE($3, status),
           priority    = COALESCE($4, priority),
           due_date    = COALESCE($5, due_date)
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [
        title ? title.trim() : null,
        description !== undefined ? description : null,
        status || null,
        priority || null,
        due_date !== undefined ? due_date : null,
        id,
        userId,
      ]
    );
    res.json({ message: 'Task updated!', task: result.rows[0] });
  } catch (err) {
    console.error('UpdateTask error:', err);
    res.status(500).json({ message: 'Server error updating task.' });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    res.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    console.error('DeleteTask error:', err);
    res.status(500).json({ message: 'Server error deleting task.' });
  }
};

// GET /api/tasks/stats — dashboard stats
const getStats = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'todo')        AS todo,
        COUNT(*) FILTER (WHERE status = 'in-progress') AS in_progress,
        COUNT(*) FILTER (WHERE status = 'done')        AS done,
        COUNT(*)                                        AS total
       FROM tasks WHERE user_id = $1`,
      [userId]
    );
    res.json({ stats: result.rows[0] });
  } catch (err) {
    console.error('GetStats error:', err);
    res.status(500).json({ message: 'Server error fetching stats.' });
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask, getStats };
