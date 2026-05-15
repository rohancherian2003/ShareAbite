const db = require("./config/db");

async function seedAdmin() {
  try {
    const adminUser = {
      name: "Admin",
      email: "admin@foodwaste.com",
      password: "admin123",
      role: "admin",
      approved: true,
      created_at: new Date().toISOString(),
    };

    // Check if exists
    const existing = await db.collection("users").where("email", "==", adminUser.email).get();
    if (!existing.empty) {
      console.log("Admin user already exists!");
      process.exit(0);
    }

    await db.collection("users").add(adminUser);
    console.log("Admin user seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding admin user:", err);
    process.exit(1);
  }
}

seedAdmin();
