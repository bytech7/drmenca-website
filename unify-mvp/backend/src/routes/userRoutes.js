const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { listUsers } = require('../services/authService');

const router = express.Router();

router.get('/users', authMiddleware, async (req, res, next) => {
  try {
    const users = await listUsers(req.user.userId);
    res.json(users);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
