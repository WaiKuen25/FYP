const calendarService = require('../services/calendarService');

// Create a new task
const createTask = async(req, res) => {
    try {
        // 管理員使用固定的系統用戶ID (假設系統用戶ID為20000)
        const userId = req.userId || (req.adminId ? 20000 : null);
        if (!userId) {
            return res.status(401).json({ success: false, message: '未授權' });
        }
        await calendarService.createTask(userId, req.body);
        res.json({ success: true, message: '任務創建成功' });
    } catch (error) {
        console.error('創建任務時出錯:', error);
        res.status(500).json({ success: false, message: '創建任務失敗' });
    }
};

// Get all tasks for a user
const getTasks = async(req, res) => {
    try {
        const userId = req.userId || (req.adminId ? 20000 : null);
        if (!userId) {
            return res.status(401).json({ success: false, message: '未授權' });
        }
        const tasks = await calendarService.getTasks(userId);
        res.json({ success: true, tasks });
    } catch (error) {
        console.error('獲取任務時出錯:', error);
        res.status(500).json({ success: false, message: '獲取任務失敗' });
    }
};

// Update a task
const updateTask = async(req, res) => {
    try {
        const userId = req.userId || (req.adminId ? 20000 : null);
        if (!userId) {
            return res.status(401).json({ success: false, message: '未授權' });
        }
        const success = await calendarService.updateTask(userId, req.params.taskId, req.body);
        if (!success) {
            return res.status(404).json({ success: false, message: '找不到任務或無權限' });
        }
        res.json({ success: true, message: '任務更新成功' });
    } catch (error) {
        console.error('更新任務時出錯:', error);
        res.status(500).json({ success: false, message: '更新任務失敗' });
    }
};

// Delete a task
const deleteTask = async(req, res) => {
    try {
        const userId = req.userId || (req.adminId ? 20000 : null);
        if (!userId) {
            return res.status(401).json({ success: false, message: '未授權' });
        }
        const success = await calendarService.deleteTask(userId, req.params.taskId);
        if (!success) {
            return res.status(404).json({ success: false, message: '找不到任務或無權限' });
        }
        res.json({ success: true, message: '任務刪除成功' });
    } catch (error) {
        console.error('刪除任務時出錯:', error);
        res.status(500).json({ success: false, message: '刪除任務失敗' });
    }
};

module.exports = {
    createTask,
    getTasks,
    updateTask,
    deleteTask
};