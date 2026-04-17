require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");
const User = require("../app/users/user.model");

const seedSuperAdmin = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/globes-properties";
    console.log("Connecting to:", mongoUri);

    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    const email = "superadmin@globes.com";

    // Check if superadmin already exists
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("ℹ️ Super Admin already exists in local database.");
      process.exit(0);
    }

    // Create Super Admin
    await User.create({
      firstName: "Super",
      lastName: "Admin",
      email: email,
      phone: "1234567890",
      password: "password123", // bcrypt logic is in the model's pre-save hook
      role: "superadmin",
      isVerified: true,
    });

    console.log("✅ Local Super Admin created successfully!");
    console.log("📧 Email: " + email);
    console.log("🔑 Password: password123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding Super Admin:", error.message);
    process.exit(1);
  }
};

seedSuperAdmin();
