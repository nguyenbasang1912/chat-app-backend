require("dotenv").config();

const { connect } = require("mongoose");

const uri = process.env.DB_URI || "mongodb://localhost:27017/chatapp";

const connectDB = () => {
  return connect(uri);
};

module.exports = connectDB;
