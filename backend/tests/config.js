const mongoose = require('mongoose');
require('dotenv').config();
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

async function connectDB() {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
}

async function disconnectDB() {
    await mongoose.disconnect();
    await mongoServer.stop();
    console.log('Disconnected from MongoDB');
}

async function clearDB() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany();
    }
    console.log('Cleared the database');
}

module.exports = { connectDB, disconnectDB, clearDB };