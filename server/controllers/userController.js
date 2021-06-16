const User = require('../models/user');
const asyncHandler = require('express-async-handler')
const { sendJSONResponse } = require('../utils')

const register = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    phone,
    password,
    address,
    geoDetails
  } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return sendJSONResponse(res, 'Account already exists', 'error', 400, null);
  }

  const user = new User();

  user.fullName = fullName;
  user.email = email;
  user.phone = phone;
  user.address = address;
  user.location = {
    type: 'Point',
    coordinates: geoDetails
  };
  user.setPassword(password);
  await user.save();
  const token = user.generateToken();
  const data = {
    token,
    user: user.response()
  }

  return sendJSONResponse(res, 'Account Created Successfully', 'success', 200, data);
})

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email });

  if (user && (user.verifyPassword(password))) {
    const token = user.generateToken();
    const data = {
      token,
      user: user.response()
    }

    return sendJSONResponse(res, 'Login Successful', 'success', 200, data);
  } else {
    return sendJSONResponse(res, 'Invalid Details', 'error', 400, null);
  }
})

module.exports = {
  register,
  login
}