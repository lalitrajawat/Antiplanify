const express = require('express');
const router = express.Router();
const {
    getTasks,
    createTask,
    updateTask,
    deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

router.route('/')
    .post(createTask);

router.route('/:id')
    .put(updateTask)
    .delete(deleteTask);

// Get tasks for a specific project
router.get('/project/:projectId', getTasks);

module.exports = router;
