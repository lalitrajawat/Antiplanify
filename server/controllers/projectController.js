const Project = require('../models/Project');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { sendProjectCreatedEmail } = require('../utils/emailService'); // 👈 email helper

// @desc    Get all projects for logged in user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
    try {
        const { search } = req.query;
        let query = { owner: req.user._id };

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const projects = await Project.find(query).sort({ pinned: -1, updatedAt: -1 });

        const projectsWithProgress = await Promise.all(
            projects.map(async (project) => {
                const tasks = await Task.find({ projectId: project._id });
                const totalTasks = tasks.length;
                const completedTasks = tasks.filter(task => task.status === 'done').length;
                const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

                return { ...project.toObject(), progress, taskCount: totalTasks };
            })
        );

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

        // 📧 Send confirmation mail (non-blocking)
        console.log('Attempting to send email to:', req.user?.email);
        if (req.user && req.user.email) {
            sendProjectCreatedEmail(req.user.email, project.title)
                .then(() => console.log('Email promise resolved'))
                .catch(err => console.error('Error sending project created email:', err));
        } else {
            console.warn('No email found for user:', req.user);
        }

        // 🔔 Create Notification
        await Notification.create({
            userId: req.user._id,
            message: `New project created: ${project.title}`
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
            req.body, { new: true }
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