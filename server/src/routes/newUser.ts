import { Router, Request, Response } from "express";
import User from "../models/User";

const router = Router();

router.post("/newUser", async (req, res) => {
  try {
    const { id, displayName, name, email } = req.body;

    // Find user by id and update if exists, or create if doesn't exist
    const user = await User.findOneAndUpdate(
      { id }, // search criteria
      { id, displayName, name, email }, // update/insert data
      {
        new: true, // return the updated/inserted document
        upsert: false, // don't create if doesn't exist
      }
    );

    if (user) {
      res.status(200).json({ message: "User already exists", user });
    } else {
      // Create new user if doesn't exist
      const newUser = new User({ id, displayName, name, email });
      await newUser.save();
      res
        .status(201)
        .json({ message: "User created successfully", user: newUser });
    }
  } catch (error) {
    console.log("Detailed error:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : "No stack trace",
      name: error instanceof Error ? error.name : "Unknown Error",
    });
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

export default router;
