// service/auth.service.js
require('dotenv').config();
const JWT = require("jsonwebtoken");
const UserEksternal = require("../models/userEksternalModels"); // Adjust the path as necessary
const TokenEksternal = require("../models/tokenEksternalModels"); // Adjust the path as necessary
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const JWTSecret = "MySuperSecretKey123!@#"; // Replace this with your actual secret
const bcryptSalt = 10; // Define your bcrypt salt rounds
const clientURL = process.env.CLIENT_URL; // Replace with your frontend URL

// Signup service
const signup = async (data) => {
  let user = await UserEksternal.findOne({ email: data.email });
  if (user) {
    throw new Error("Email already exists");
  }

  user = new UserEksternal(data);
  const token = JWT.sign({ id: user._id }, JWTSecret);
  await user.save();
  
  return {
    userId: user._id,
    email: user.email,
    userName: user.userName,
    userPhone: user.userPhone,
    imageName: user.imageName,
    token: token,
  };
};

// Password reset request service with 401 error handling
const requestPasswordResetEksternal = async (email) => {
  const user = await UserEksternal.findOne({ email });

  // Jika user tidak ditemukan, kirimkan error 401
  if (!user) {
    const error = new Error("Email tidak ditemukan di datadata.");
    error.statusCode = 401; // Mengatur status error 401
    throw error; // Lempar error untuk ditangani di controller
  }

  let token = await TokenEksternal.findOne({ userId: user._id });
  if (token) await token.deleteOne();

  let resetToken = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));

  await new TokenEksternal({
    userId: user._id,
    token: hash,
    createdAt: Date.now(),
  }).save();

  const link = `${clientURL}/passwordReset?token=${resetToken}&id=${user._id}`;
  
  // Mengirim email reset password
  sendEmail(
    user.email,
    "Password Reset Request",
    { name: user.userName, link: link },
    "../utils/template/requestResetPassword.handlebars"
  );
  
  return link; // Mengembalikan link reset untuk referensi
};

const resetPasswordEksternal = async (userId, token, password) => {
  let passwordResetToken = await TokenEksternal.findOne({ userId });

  if (!passwordResetToken) {
    throw { status: 400, message: "Expired password reset token" }; // Kembalikan status 400
  }

  const isValid = await bcrypt.compare(token, passwordResetToken.token);
  if (!isValid) {
    throw { status: 401, message: "Invalid password reset token" }; // Kembalikan status 401
  }

  const hash = await bcrypt.hash(password, Number(bcryptSalt));

  await UserEksternal.updateOne(
    { _id: userId },
    { $set: { password: hash } },
    { new: true }
  );

  const user = await UserEksternal.findById({ _id: userId });
  sendEmail(
    user.email,
    "Password Reset Successfully",
    { name: user.userName },
    "../utils/template/resetPassword.handlebars"
  );

  await passwordResetToken.deleteOne();

  return true;
};


module.exports = {
  signup,
  requestPasswordResetEksternal,
  resetPasswordEksternal,
};
