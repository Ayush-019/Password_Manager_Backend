const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
const {
  login,
  logout,
  addEntry,
  getAllEntries,
  updateEntry,
  deleteEntry,
} = require("./Controllers/controllers");

const PORT = process.env.PORT || 8000;

function isAuthenticatedUser(db) {
  return function (req, res, next) {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({
        status: "unauthenticated",
        message: "You are not logged in!",
      });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    db.query(
      `SELECT * FROM users WHERE email = '${decodedData.email}'`,
      (err, results) => {
        if (err) {
          return res.status(400).json("Error in database query!");
        }
        if (results.length === 0) {
          return res.status(400).json("Incorrect email or password!");
        }

        req.user = results;
      }
    );
    next();
  };
}

//Database connection
const db = mysql.createConnection({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

//Routes
app.post("/login", (req, res) => {
  login(req, res, db);
});

app.post("/logout", (req, res) => {
  logout(req, res);
});

app.post("/addentry", (req, res) => {
  addEntry(req, res, db);
});

app.get("/entries", (req, res) => {
  getAllEntries(req, res, db);
});

app.put("/updateentry/:id", (req, res) => {
  updateEntry(req, res, db);
});

app.delete("/deleteentry/:id", (req, res) => {
  deleteEntry(req, res, db);
});

// app.get("/", (req, res) => {
//   console.log("Server is running");
// });

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
