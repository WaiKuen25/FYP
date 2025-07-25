const { dbConnection } = require("../config/db");
const pool = dbConnection().promise();

const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toISOString().slice(0, 19).replace('T', ' ');
};

const createTask = async(userId, taskData) => {
    const { title, description, startTime, endTime } = taskData;
    const query = `
        INSERT INTO calendar_tasks (userId, title, description, startTime, endTime)
        VALUES (?, ?, ?, ?, ?)
    `;
    await pool.query(query, [
        userId,
        title,
        description,
        formatDateTime(startTime),
        formatDateTime(endTime)
    ]);
};

const getTasks = async(userId) => {
    const query = `
        SELECT 
            taskId,
            userId,
            title,
            description,
            DATE_FORMAT(startTime, '%Y-%m-%dT%H:%i:%s.000Z') as startTime,
            DATE_FORMAT(endTime, '%Y-%m-%dT%H:%i:%s.000Z') as endTime
        FROM calendar_tasks 
        WHERE userId = ?
        ORDER BY startTime ASC
    `;
    const [tasks] = await pool.query(query, [userId]);
    return tasks;
};

const updateTask = async(userId, taskId, taskData) => {
    const { title, description, startTime, endTime } = taskData;
    const query = `
        UPDATE calendar_tasks 
        SET title = ?, description = ?, startTime = ?, endTime = ?
        WHERE taskId = ? AND userId = ?
    `;
    const [result] = await pool.query(query, [
        title,
        description,
        formatDateTime(startTime),
        formatDateTime(endTime),
        taskId,
        userId
    ]);
    return result.affectedRows > 0;
};

const deleteTask = async(userId, taskId) => {
    const query = `
        DELETE FROM calendar_tasks 
        WHERE taskId = ? AND userId = ?
    `;
    const [result] = await pool.query(query, [taskId, userId]);
    return result.affectedRows > 0;
};

module.exports = {
    createTask,
    getTasks,
    updateTask,
    deleteTask
};