require("dotenv").config();

const { connect } = require("mongoose");

const uri = process.env.DB_URI || "mongodb://localhost:27017/chatapp";

module.exports = connect(uri);
