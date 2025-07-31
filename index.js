require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Item = require('./model/item');
const User = require('./model/user');  
const authMiddleware = require('./middleware/auth');

const app = express();
app.use(express.json());


// Geschützte Route:
app.get('/me', authMiddleware, async (req, res) => {
  // req.userId kommt aus dem validierten Token
  const user = await User.findById(req.userId).select('-password');
  res.json(user);
});

// MongoDB verbinden
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// CREATE
app.post('/items', async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ
app.get('/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).send('Item not found');
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
app.put('/items/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).send('Item not found');
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
app.delete('/items/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).send('Item not found');
    res.send('Item deleted');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server läuft auf http://localhost:${PORT}`));
