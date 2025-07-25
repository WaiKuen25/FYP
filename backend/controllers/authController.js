const authService = require("../services/authService");

exports.login = async (req, res) => {
  authService.login(req, res);
};

exports.register = async (req, res) => {
  authService.register(req, res);
};

exports.verifyEmail = async (req, res) => {
  authService.verifyEmail(req, res);
};
