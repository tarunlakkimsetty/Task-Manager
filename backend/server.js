// Load dotenv only in development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = require("./app");
const sequelize = require("./config/db");

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Validate JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is not set!");
  console.error("   Set JWT_SECRET in environment variables");
  process.exit(1);
}

// Log startup info
console.log(`
┌─────────────────────────────────────────────┐
│   TaskFlow Backend Starting...              │
├─────────────────────────────────────────────┤
│ Environment: ${NODE_ENV === "production" ? "🔴 PRODUCTION" : "🟢 DEVELOPMENT"}
│ Port: ${PORT}
│ Node Version: ${process.version}
└─────────────────────────────────────────────┘
`);

// Retry logic for database connection (attempt once, then give up gracefully)
async function connectDatabase() {
  const maxRetries = 3;  // Quick fail
  let retries = 0;

  while (retries < maxRetries) {
    try {
      console.log(`🔗 Attempting database connection (attempt ${retries + 1}/${maxRetries})...`);
      await Promise.race([
        sequelize.authenticate(),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Connection timeout (3s)")), 3000);
        }),
      ]);
      console.log("✅ Database connected successfully");
      
      // Sync models to create tables
      console.log("📊 Syncing database models...");
      await sequelize.sync({ alter: true });
      console.log("✅ Database models synced");
      
      return true;
    } catch (error) {
      retries++;
      const reason = error && error.message ? error.message.split("\n")[0] : "Unknown database error";
      console.log(`   ⚠️  Connection failed: ${reason}`);
      
      if (retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  console.log("⚠️  Database unavailable - API will run in read-only mode");
  return false;
}

// Start server
const startServer = async () => {
  try {
    // Start Express server first so Railway health checks pass while DB retries continue.
    const server = app.listen(PORT, () => {
      console.log(`
╔═════════════════════════════════════════════╗
║   ✅ TaskFlow API Server Running            ║
╠═════════════════════════════════════════════╣
║ Environment: ${NODE_ENV.padEnd(34)}║
║ Port: ${PORT.toString().padEnd(40)}║
║ Started: ${new Date().toISOString()}
╚═════════════════════════════════════════════╝
      `);
    });

    // Initialize DB connection in the background.
    connectDatabase().then((ok) => {
      app.locals.dbReady = ok;
      if (!ok) {
        console.error("❌ API is up, but database is still unavailable.");
      }
    });

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      console.log("📡 SIGTERM received, shutting down gracefully...");
      server.close(async () => {
        await sequelize.close();
        console.log("✅ Server shut down gracefully");
        process.exit(0);
      });
    });

  } catch (error) {
    console.error("❌ Failed to start server");
    console.error("Error:", error && error.message ? error.message : error);
    process.exit(1);
  }
};

// Start server
startServer();