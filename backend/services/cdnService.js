const path = require('path');

const servePhoto = (req, res) => {
    const { postId, photo } = req.params;
    const filePath = path.join(__dirname, '..', 'cdn', 'post', postId, photo);

    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send('File not found');
        }
    });
};

const serveAvator = (req, res) => {
    const { userId, photo } = req.params;
    const filePath = path.join(__dirname, '..', 'cdn', 'avator', userId, photo);

    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send('File not found');
        }
    });
};

const serveCategory = (req, res) => {
    const { categoryId } = req.params;
    const filePath = path.join(__dirname, '..', 'cdn', 'category', `${categoryId}.png`);

    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send('File not found');
        }
    });
};

module.exports = { servePhoto, serveAvator, serveCategory };