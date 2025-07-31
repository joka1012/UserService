const jwt = require('jsonwebtoken');
const JWT_SECRET = 'dein_geheimes_token'; // besser: aus .env laden

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Kein Token übermittelt' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id; // Token-Daten an die Anfrage anhängen
    next(); // weiter zur Route
  } catch (err) {
    return res.status(401).json({ error: 'Ungültiger Token' });
  }
}

module.exports = authMiddleware;