const express        = require("express");
const authController = express.Router();
const passport       = require("passport");

const User           = require("../models/user");

const bcrypt         = require("bcrypt");
const bcryptSalt     = 19;

authController.post("/signup", (req, res, next) => {
  const { username, password, name, secret } = req.body

  if (!username || !password || !name || !secret) {
    res.status(400).json({ message: "Provide all the fields to sign up" });
  }

  User.findOne({ username }, "username", (err, user) => {
    if (user !== null) {
      res.status(400).json({ message: "The username already exists" });
      return;
    }

    let salt     = bcrypt.genSaltSync(bcryptSalt);
    let hashPass = bcrypt.hashSync(password, salt);

    let newUser  = User({
      username,
      password: hashPass,
      name,
      secret
    });

    console.log(newUser);

    newUser.save((err) => {
      if (err) { res.status(400).json({ message: "Something went wrong" }); }
      else {
        req.login(newUser, (err) => {
          if (err) { return res.status(500).json({ message: "Something went wrong" }); }
          res.status(200).json(req.user);
        });
      }
    });
  });
});

authController.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) { return res.status(401).json(err); }
    if (!user) { return res.status(401).json(info); }

    req.login(user, (err) => {
      if (err) { return res.status(500).json({ message: "Something went wrong" }); }
      return res.status(200).json(req.user);
    });
  })(req, res, next);
});

authController.post("/logout", (req, res) => {
  req.logout();
  res.status(200).json({ message: "Success" });
});

authController.get("/loggedin", (req, res) => {
  if (req.isAuthenticated()) { return res.status(200).json(req.user); }
  return res.status(403).json({ message: "Unauthorized" });
});

authController.get("/private", (req, res) => {
  if (req.isAuthenticated()) { return res.json({ message: req.user.secret }); }
  return res.status(403).json({ message: "Unauthorized" });
});


module.exports = authController;
