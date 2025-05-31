const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Usa express.json() directamente en la ruta:
router.post('/login', express.json(), login);
router.post('/register', express.json(), register);

module.exports = router;
