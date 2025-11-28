const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Get all projects for logged in user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({ owner: req.user._id }).sort({ pinned: -1, updatedAt: -1 });

        // Calculate progress for each project (optional optimization: do this in aggregation)
        const projectsWithProgress = await Promise.all(projects.map(async (project) => {
            const tasks = await Task.find({ projectId: project._id });
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(task => task.status === 'done').length;
            const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

            return { ...project.toObject(), progress };
        }));

        res.json(projectsWithProgress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
    const { title, description, startDate, endDate, techStack, pinned, emailAlerts, notes } = req.body;

    try {
        const project = await Project.create({
            owner: req.user._id,
            title,
            description,
            startDate,
            endDate,
            techStack,
            pinned,
            emailAlerts,
            notes
        });

        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedProject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await project.deleteOne();
        // Also delete associated tasks
        await Task.deleteMany({ projectId: req.params.id });

        res.json({ message: 'Project removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProjects,
    createProject,
    getProjectById,
    updateProject,
    deleteProject
};
