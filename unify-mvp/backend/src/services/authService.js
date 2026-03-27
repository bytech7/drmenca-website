const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const createToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is missing in environment variables.');

  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

const registerUser = async ({ email, password, preferred_language }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const err = new Error('Email already registered.');
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    password: hashedPassword,
    preferred_language: preferred_language || 'en',
  });

  return {
    user: {
      id: user._id,
      email: user.email,
      preferred_language: user.preferred_language,
    },
    token: createToken(user._id),
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    const err = new Error('Invalid credentials.');
    err.statusCode = 401;
    throw err;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const err = new Error('Invalid credentials.');
    err.statusCode = 401;
    throw err;
  }

  return {
    user: {
      id: user._id,
      email: user.email,
      preferred_language: user.preferred_language,
    },
    token: createToken(user._id),
  };
};

const listUsers = async (currentUserId) => {
  return User.find({ _id: { $ne: currentUserId } }).select('_id email preferred_language').sort({ email: 1 });
};

module.exports = { registerUser, loginUser, listUsers };
