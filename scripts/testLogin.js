require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");
const User = require("../app/users/user.model");
const bcrypt = require("bcryptjs");

const testLogin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB:", mongoUri);

    const email = "superadmin@globes.com";
    const password = "password123";

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.log("❌ User not found in DB");
      process.exit(1);
    }

    console.log("User found:", user.email);
    console.log("User role:", user.role);
    console.log("User isActive:", user.isActive);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match result (bcrypt.compare):", isMatch);

    const isMatchModel = await user.comparePassword(password);
    console.log("Password match result (user.comparePassword):", isMatchModel);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

testLogin();
