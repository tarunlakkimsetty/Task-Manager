require('dotenv').config();

const app = require("./app");
const sequelize = require("./config/db");

// Load model associations
require("./models/associations");

const PORT = process.env.PORT || 5000;

sequelize.sync()
  .then(() => {
    console.log("Database connected ✅");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("DB Error:", err);
  });