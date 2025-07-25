const { Server } = require("socket.io");

let io;

const initSocketIO = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Adjust the origin according to your needs
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initSocketIO, getIO };
