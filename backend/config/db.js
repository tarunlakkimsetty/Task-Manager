const { Sequelize } = require("sequelize");

// Load dotenv only in development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Debug: Log DATABASE_URL setup (mask the password)
// Prefer DATABASE_PUBLIC_URL from Postgres service, fallback to DATABASE_URL
const dbUrl = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
if (dbUrl) {
  const maskedUrl = dbUrl.replace(/:[^:@]*@/, ":****@");
  console.log("📡 Database URL configured:", maskedUrl);
  if (process.env.DATABASE_PUBLIC_URL) {
    console.log("   Using PUBLIC endpoint (switchback.proxy.rlwy.net)");
  }
}

const useSSL = process.env.DB_SSL === "true" || process.env.NODE_ENV === "production";

// Validate DATABASE_URL
if (!dbUrl) {
  console.error("❌ DATABASE_URL is not set!");
  console.error("   Set DATABASE_URL in environment variables");
  if (process.env.NODE_ENV !== "production") {
    console.error("   Example: postgres://user:password@localhost:5432/dbname");
  }
  process.exit(1);
}

// Simple Sequelize config for Railway PostgreSQL
const sequelize = new Sequelize(dbUrl, {
  dialect: "postgres",
  logging: false,
  dialectOptions: useSSL
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
  pool: {
    max: 3,
    min: 0,
    acquire: 10000,
    idle: 30000,
  },
});

module.exports = sequelize;