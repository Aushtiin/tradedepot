const mongoose = require('mongoose');
const { randomBytes, pbkdf2Sync } = require('crypto');
const { sign } = require('jsonwebtoken');
const pick = require('lodash/pick');

const UserSchema = new mongoose.Schema({
  fullName : {
    type: String,
    lowercase: true,
    trim: true
  }, 
  email: {
    type: String,
    lowercase: true,
    trim: true
  }, 
  hash: String,
  salt: String,
  address: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
}, { timestamps: true });

UserSchema.index({ location: '2dsphere' });

UserSchema.methods.setPassword = function userPassword(password) {
  this.salt = randomBytes(16).toString('hex');
  this.hash = pbkdf2Sync(password, this.salt, 100, 64, 'sha512').toString('hex');
};

UserSchema.methods.verifyPassword = function verify(password) {
  const hash = pbkdf2Sync(password, this.salt, 100, 64, 'sha512').toString('hex');
  return this.hash === hash;
};

UserSchema.methods.response = function response() {
  return pick(this, [
    '_id',
    'fullName',
    'email',
    'address',
    'location',
  ]);
};

UserSchema.methods.generateToken = function token(time = '7d') {
  return sign(
    {
      _id: this._id,
      fullName: this.fullName,
      email: this.email,
    },
    process.env.JWT, {
      issuer: 'http://tradedepot',
      expiresIn: time,
    },
  );
};

const User = mongoose.model('User', UserSchema);

module.exports = User