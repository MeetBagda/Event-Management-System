const express = require("express");
const router = express.Router();
const { User } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const zod = require("zod");
const cors = require("cors");
const { userSchemaTypes } = require("../types");
const { authMiddleware } = require("../middleware");
const bcrypt = require("bcrypt");

router.use(cors());

router.get("/me", authMiddleware, async (req, res) => {
    const user = await User.findById(req.userId);

    if (!user) {
        return res.status(404).json({
            message: "User not found",
        });
    }

    res.json({
        id: user._id,
        username: user.username,
    });
});

router.post("/signup", async (req, res) => {
  const createPayLoad = req.body;
  const parsedPayLoad = userSchemaTypes.safeParse(createPayLoad);

  if (!parsedPayLoad.success) {
    return res.status(411).json({
      msg: "Invalid input",
      errors: parsedPayLoad.error.issues,
    });
  }

  try {
    const user = await User.create({
      email: createPayLoad.email,
      username: createPayLoad.username,
      password: createPayLoad.password,
    });

    const userId = user._id;

    const token = jwt.sign({ userId: userId }, JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({
      msg: "User created successfully",
      token: token,
      userId: userId,
    });
  } catch (error) {
    console.error("Error during User creation:", error);

    res.status(500).json({
      msg: "Error creating user",
      error: error.message,
    });
  }
});

const signinBody = zod.object({
  email: zod.string().email("Invalid email address"),
  password: zod.string(),
});

router.post("/signin", async (req, res) => {
    const { success, error } = signinBody.safeParse(req.body);
    if (!success) {
      return res.status(400).json({
        msg: "Invalid input",
        errors: error.errors,
      });
    }
  
    try {
      const user = await User.findOne({ email: req.body.email });
  
      if (!user) {
        return res.status(401).json({ msg: "Incorrect email or password" });
      }
  
      // Compare the provided password with the stored hashed password
      const passwordMatch = await bcrypt.compare(req.body.password, user.password);
  
      if (!passwordMatch) {
        return res.status(401).json({ msg: "Incorrect email or password" });
      }
  
      const userId = user._id;
      const token = jwt.sign({ userId: userId }, JWT_SECRET, { expiresIn: "1h" });
  
      res.json({
        token: token,
        userId: userId,
      });
    } catch (error) {
      console.error("Error during signin:", error);
      res.status(500).json({
        msg: "Failed to sign in",
        error: error.message,
      });
    }
  });

router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "_id username email");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ msg: "Error fetching users", error: error.message });
  }
});

module.exports = router;