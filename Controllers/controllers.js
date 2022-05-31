const jwt = require("jsonwebtoken");

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
  const cookie = res.cookie("jwt", token, cookieOptions);
  res.status(statuscode).json({
    status: "success",
    token,
    user,
  });
};

exports.login = async (req, res, db) => {
  const { email, password } = req.body;
  console.log(email,password)
  if (!email || !password) {
    return res.status(400).json("Incorrect Datatype Submission!");
  }
  db.query(
    `SELECT * FROM user WHERE email = '${email}' AND password = '${password}'`,
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
};


exports.logout = async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out Successfully",
  });
};


exports.addEntry = async (req, res,db) => {
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
};


exports.getAllEntries = async(req, res,db) => {
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
};


exports.updateEntry = async (req, res,db) => {
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
};


exports.deleteEntry = async (req, res,db) => {
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
};

