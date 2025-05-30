const express = require('express');
const router = express.Router();
const verifyToken = require('../Middleware/authMiddleware');
const { sendMessage, getHistory, exportHistory, resetHistory } = require('../controllers/chatController');

router.post('/send', verifyToken, sendMessage);
router.get('/history', verifyToken, getHistory);
router.post('/export', verifyToken, exportHistory);
router.delete('/reset', verifyToken, resetHistory);


module.exports = router;
