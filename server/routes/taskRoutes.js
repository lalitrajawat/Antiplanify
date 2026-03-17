const express = require('express');
const router = express.Router();
const {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    getTasksToday
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

router.route('/')
    .post(createTask);

router.get('/today', getTasksToday);

// Get tasks for a specific project
router.get('/project/:projectId', getTasks);

router.route('/:id')
    .put(updateTask)
    .delete(deleteTask);

module.exports = router;
