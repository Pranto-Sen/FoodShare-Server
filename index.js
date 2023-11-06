const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
// const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");
// const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



app.get("/", (req, res) => {
  res.send("Server running");
});
app.listen(port, () => {
  console.log(`FoodService is running on port ${port}`);
});
