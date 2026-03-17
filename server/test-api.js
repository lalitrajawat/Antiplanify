const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let token = ''; // User should set this or we login first

const testBackend = async () => {
    console.log('🚀 Starting Backend Verification...\n');

    try {
        // 1. Test Login (Change credentials as needed)
        console.log('🔑 Testing Auth...');
        const authRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'test@example.com',
            password: 'password123'
        });
        token = authRes.data.token;
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('✅ Auth successful\n');

        // 2. Test Today's Tasks
        console.log('📅 Testing Today\'s Tasks...');
        const todayTasks = await axios.get(`${API_URL}/tasks/today`);
        console.log(`✅ Fetched ${todayTasks.data.length} tasks due today\n`);

        // 3. Test Project Search
        console.log('🔍 Testing Project Search...');
        const searchRes = await axios.get(`${API_URL}/projects?search=Planify`);
        console.log(`✅ Search successful. Found ${searchRes.data.length} matches\n`);

        // 4. Test Notifications
        console.log('🔔 Testing Notifications...');
        const notifs = await axios.get(`${API_URL}/notifications`);
        console.log(`✅ Fetched ${notifs.data.length} notifications\n`);

        // 5. Test AI Chat with Context
        console.log('🤖 Testing AI Chat Context...');
        const chatRes = await axios.post(`${API_URL}/chat`, {
            message: "Analyze my project",
            projectContext: {
                title: "Planify Test",
                description: "A test project",
                tasks: [{ title: "Test task", status: "todo", priority: "high" }]
            }
        });
        console.log('✅ AI Response received:', chatRes.data.reply.substring(0, 50) + '...\n');

        console.log('✨ All backend tests passed!');
    } catch (err) {
        console.error('❌ Test failed:', err.response?.data?.message || err.message);
    }
};

testBackend();
