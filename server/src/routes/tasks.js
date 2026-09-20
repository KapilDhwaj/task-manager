const express = require('express');
const auth = require('../middleware/auth');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getStats,
} = require('../controllers/taskController');

const router = express.Router();

// All task routes require authentication
router.use(auth);

router.get('/stats', getStats);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
