const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const itemSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true},
  password: { type: String, required: true },
  price: { type: Number, default: 0 },
  cash: { type: Number, default: 0 },
  potato: { type: Number, default: 0 },
  turns: { type: Number, default: 0 }
});

module.exports = mongoose.model('Item', itemSchema);

// Passwort-Hashing vor dem Speichern
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Methode zum Passwortvergleich
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);