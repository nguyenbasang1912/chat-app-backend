require("dotenv").config();
const app = require("./src/app");
const { createServer } = require("http");
const connectDB = require("./src/configs/connectDB");

const server = createServer(app);
const port = process.env.PORT || 8000;

server.listen(port, () => {
  connectDB()
    .then(() => {
      console.log("Connect db successfully");
    })
    .catch(console.log);
  console.log(`Server running on ${port}`);
});
