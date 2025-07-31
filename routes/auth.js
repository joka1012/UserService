const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('./models/user');

const router = express.Router();
const JWT_SECRET = 'dein_geheimes_token'; // in .env speichern

// Registrierung
router.post('/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: 'User erstellt' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).send('Benutzer nicht gefunden');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).send('Falsches Passwort');

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;