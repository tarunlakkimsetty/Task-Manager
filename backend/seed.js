require('dotenv').config();

const bcrypt = require('bcrypt');
const sequelize = require('./config/db');
const User = require('./models/User');

// Load model associations
require('./models/associations');

const seedDatabase = async () => {
  try {
    // Sync database
    await sequelize.sync();
    console.log('Database synced ✅');

    // Check if test user already exists
    const existingUser = await User.findOne({
      where: { email: 'tarunlakkimsetty@gmail.com' },
    });

    if (existingUser) {
      console.log('Test user already exists!');
      console.log(`Email: ${existingUser.email}`);
      console.log(`Username: ${existingUser.username}`);
      return;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);

    const testUser = await User.create({
      username: 'Sai Tarun Lakkimsetty',
      email: 'tarunlakkimsetty@gmail.com',
      password: hashedPassword,
    });

    console.log('✅ Test user created successfully!');
    console.log('-----------------------------------');
    console.log('Username:', testUser.username);
    console.log('Email:', testUser.email);
    console.log('Password: password123');
    console.log('-----------------------------------');
    console.log('\nYou can now login with these credentials!');
  } catch (error) {
    console.error('❌ Seed Error:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

seedDatabase();
