const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const {
    signup,
    login,
    getProfile,
    getDashboard,
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', requireAuth, getProfile);
router.get('/dashboard', requireAuth, getDashboard);

module.exports = router;
