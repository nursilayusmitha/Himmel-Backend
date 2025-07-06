const Auth = require("../models/Auth.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtKey = 'himmel';
var session = require('express-session');

// Import the new services from auth.service.js
const {
  signup,
  requestPasswordReset,
  resetPassword,
} = require("../services/Auth.service");
const {
  requestPasswordResetEksternal,
  resetPasswordEksternal,
} = require("../services/AuthEksternal.service");

// Existing RegisterAuth
const RegisterAuth = (req, res) => {
  try {
    Auth.find({ Auth_email: req.body.email }).exec().then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "Email sudah Terdaftar"
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            const newAuth = new Auth({
              Auth_username: req.body.username,
              Auth_email: req.body.email,
              Auth_password: hash,
              Auth_role: req.body.role,
              Auth_status: "Y",
              Auth_created: new Date().toISOString().slice(0, 10),
              Auth_domain: req.body.domain,
              Auth_still_logged: "N"
            });
            newAuth.save().then(result => {
              res.status(201).json(result);
            });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Existing LoginAuth
const LoginAuth = async (req, res) => {
  try {
    await Auth.find({ Auth_email: req.body.email })
      .exec()
      .then(user => {
        if (user.length < 1) {
          return res.status(401).json({
            message: 'Email tidak ada'
          });
        } else {
          username = user[0].Auth_username;
          const dtkubody = req.body;
          bcrypt.compare(req.body.password, user[0].Auth_password, (err, result) => {
            if (result) {
              const token = jwt.sign(dtkubody, jwtKey, { algorithm: 'HS256' });
              const hasil = user[0];
              return res.status(200).json({
                message: 'Berhasil Login',
                token: token,
                data: hasil
              });
            } else {
              return res.status(401).json({
                message: 'Email dan password tidak sesuai'
              });
            }
          });
        }
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Existing LogoutAuth
const LogoutAuth = async (req, res) => {
  try {
    const { id } = req.params;
    const LogoutAuth = await Auth.findByIdAndUpdate(id, {
      Auth_still_logged: "N",
      $push: {
        Auth_history_login: {
          "Auth_history_login_tanggal": new Date().toISOString().slice(0, 10)
        }
      }
    });
    if (!LogoutAuth) {
      return res.status(404).json({ message: "Tidak ada" });
    }
    const HasilLogout = await Auth.findById(id);
    res.status(200).json(HasilLogout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Existing LogAuth
const LogAuth = async (req, res) => {
  try {
    const { id } = req.params;
    const LogoutAuth = await Auth.findByIdAndUpdate(id, {
      $push: {
        Auth_history: req.body.Auth_history
      }
    });
    if (!LogoutAuth) {
      return res.status(404).json({ message: "Tidak ada" });
    }
    const HasilLog = await Auth.findById(id);
    res.status(200).json(HasilLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// NEW: Controller for password reset request
const resetPasswordRequestController = async (req, res) => {
  try {
    const requestPasswordResetService = await requestPasswordReset(req.body.email);
    return res.json({ message: "Password reset link sent!", link: requestPasswordResetService });
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};

const resetPasswordEksternalController = async (req, res) => {
  try {
    const resetPasswordService = await resetPasswordEksternal(
      req.body.userId,
      req.body.token,
      req.body.password
    );
    return res.json({ message: "Password reset successful!" });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
};


// NEW: Controller for password reset request
const resetPasswordRequestEksternalController = async (req, res) => {
  try {
    const requestPasswordResetService = await requestPasswordResetEksternal(req.body.email);
    return res.json({ message: "Password reset link sent!", link: requestPasswordResetService });
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};

const resetPasswordController = async (req, res) => {
  try {
    const resetPasswordService = await resetPassword(
      req.body.userId,
      req.body.token,
      req.body.password
    );
    return res.json({ message: "Password reset successful!" });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
};

module.exports = {
  RegisterAuth,
  LoginAuth,
  LogoutAuth,
  LogAuth,
  resetPasswordRequestController, // Export the new functions
  resetPasswordController, // Export the new functions
  resetPasswordEksternalController,
  resetPasswordRequestEksternalController,
};
