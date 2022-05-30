const express = require("express");
require("dotenv").config();
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

const PORT = process.env.PORT || 8000;

//Database connection
const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "password",
  database: "entriesdb",
});

//json web token
const signJwt = (email) => {
  return jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

const sendToken = (user, statuscode, req, res) => {
  const token = signJwt(user.email);
  const cookieOptions = {
    exp: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: true,
  };
  res.cookie("jwt", token, cookieOptions);
  res.status(statuscode).json({
    status: "success",
    token,
    user,
  });
};


//Controllers and routes
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json("Incorrect Datatype Submission!");
  }
  db.query(
    `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`,
    (err, results) => {
      if (err) {
        return res.status(400).json("Error in database query!");
      }
      if (results.length === 0) {
        return res.status(400).json("Incorrect email or password!");
      }

      const user = {
        email,
        password,
      };

      sendToken(user, 200, req, res);
    }
  );
});

app.post("/logout", (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out Successfully",
  });
});

app.post("/addentry", (req, res) => {
  const { username, password, sitename } = req.body;

  db.query(
    "INSERT INTO entries (username,password,sitename) VALUES (?,?,?)",
    [username, password, sitename],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.status(200).json({
          message: "Entry added successfully",
          success: true,
        });
      }
    }
  );
});

app.get("/entries", (req, res) => {
  db.query("SELECT * FROM entries", (err, result) => {
    if (err) {
      console.log(err);
    }
    res.status(200).json({
      message: "Entry added successfully",
      success: true,
      entries: result,
    });
  });
});

app.put("/updateentry/:id", (req, res) => {
  const id = req.params.id;
  const { username, password, sitename } = req.body;
  db.query(
    "UPDATE entries SET username = ?, password = ?, sitename = ?  WHERE id = ?",
    [username, password, sitename, id],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.status(200).json({
          message: "Entry added successfully",
          success: true,
          entries: result,
        });
      }
    }
  );
});

app.delete("/deleteentry/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM entries WHERE id = ?", id, (err, result) => {
    if (err) {
      console.log(err, "hello");
    } else {
      res.status(200).json({
        message: "Entry added successfully",
        success: true,
        result,
      });
    }
  });
});


//Middleware
exports.isAuthenticatedUser = async (req, res, next) => {
  const token = req.cookies.jwt;

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

    })
  next();
};

app.get("/", (req, res) => {
  console.log("Server is running");
});

// app.use(ErrorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
