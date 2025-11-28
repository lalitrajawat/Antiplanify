const express = require('express');
const router = express.Router();
const {
    getProjects,
    createProject,
    getProjectById,
    updateProject,
    deleteProject
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

router.route('/')
    .get(getProjects)
    .post(createProject);

router.route('/:id')
    .get(getProjectById)
    .put(updateProject)
    .delete(deleteProject);

module.exports = router;
