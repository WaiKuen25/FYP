const cdnService = require("../services/cdnService");

exports.servePhoto = (req, res) => {
    cdnService.servePhoto(req, res);
}

exports.serveAvator = (req, res) => {
    cdnService.serveAvator(req, res);
}

exports.serveCategory = (req, res) => {
    cdnService.serveCategory(req, res);
}