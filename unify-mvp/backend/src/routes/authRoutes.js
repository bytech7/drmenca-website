const express = require('express');
const { registerUser, loginUser } = require('../services/authService');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, preferred_language } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await registerUser({ email, password, preferred_language });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await loginUser({ email, password });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
