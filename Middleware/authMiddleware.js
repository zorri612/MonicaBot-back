// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Agrega userId y demás info al request
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = verifyToken;
// 