require("dotenv").config();
const { server } = require("./app");
const PORT = process.env.PORT || 8081;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
