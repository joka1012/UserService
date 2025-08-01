require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const User = require("./model/user");
const authMiddleware = require("./middleware/auth");
const cors = require("cors");
const app = express();
app.use(cors());

app.use(express.json());

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

// Geschützte Route:
app.get("/me", authMiddleware, async (req, res) => {
  // req.userId kommt aus dem validierten Token
  const user = await User.findById(req.userId).select("-password");
  res.json(user);
});

// MongoDB verbinden
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// READ
app.get("/users/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User not found");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/users/:username", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "-password"
    );
    if (!user) return res.status(404).send("User not found");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
app.put("/users/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).send("User not found");
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/me/game", authMiddleware, async (req, res) => {
  try {
    const allowedFields = ["cash", "potato", "turns"];
    const update = {};

    // Nur erlaubte Felder updaten
    for (let field of allowedFields) {
      if (req.body[field] !== undefined) {
        update[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ error: "User nicht gefunden" });

    res.json({ message: "Spielstand aktualisiert", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
app.delete("/users/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).send("User not found");
    res.send("User deleted");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server läuft auf http://localhost:${PORT}`)
);
