const User = require("./User");
const Task = require("./Task");

// Define relationships
User.hasMany(Task, {
  foreignKey: "UserId",
  onDelete: "CASCADE", // Delete tasks when user is deleted
});

Task.belongsTo(User, {
  foreignKey: "UserId",
});

module.exports = { User, Task };
