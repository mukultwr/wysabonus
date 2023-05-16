const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { db } = require("../utils/db");

const signup = async (req, res) => {
  try {
    const { nickname, password } = req.body;

    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE nickname = ?",
      [nickname]
    );
    if (existingUser.length > 0) {
      return res.status(409).json({
        message: "Nickname already exists. Please choose a different nickname.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query("INSERT INTO users (nickname, password) VALUES (?, ?)", [
      nickname,
      hashedPassword,
    ]);

    res.status(201).json({ message: "User created successfully." });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const login = async (req, res) => {
  try {
    const { nickname, password } = req.body;

    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE nickname = ?",
      [nickname]
    );
    if (existingUser.length === 0) {
      return res.status(401).json({ message: "Invalid nickname or password." });
    }

    const user = existingUser[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid nickname or password." });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

    res.cookie("token", token, { httpOnly: true });

    res.status(200).json({ message: "Login successful." });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { signup, login };
