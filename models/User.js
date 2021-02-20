const crypto = require('crypto');
const mongoose = require('mongoose');
const JsonWebToken = require('jsonwebtoken');
const { genSalt, hash, compare } = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide a unique username"],
    unique: true
  },
  firstName: {
    type: String,
    required: [true, "Please provide your first name"]
  },
  lastName: {
    type: String,
    required: [true, "Please provide your last name"]
  },
  email: {
    type: String,
    required: [true, "Please provide a unique email address"],
    unique: true,
    match: [
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email address"
    ]
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 6,
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
});


// this refers to the user from where that method is called

// Generates a secure salted password before registering: .pre('save')
UserSchema.pre('save', async function(next) {
  if(!this.isModified('password')) next();
  
  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);
  next();
});

// Compares entered password and the password saved in the DB (login)
UserSchema.methods.matchPasswords = async function(password) {
  return await compare(password, this.password);
};

// Generates a new web token for registering and logging in
UserSchema.methods.getSignedToken = function () {
  return JsonWebToken.sign(
    {id: this._id},
    process.env.JWT_SECRET,
    {expiresIn: process.env.JWT_EXPIRES}
  );
}

// Generates a new web token for resetting password
UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(50).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 900000; // 15 minutes
  return resetToken;
}

const User = mongoose.model('User', UserSchema, 'users');
module.exports = User;