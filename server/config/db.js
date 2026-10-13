import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/doseflow';

  try {
    // Attempt standard connection with 15-second timeout for Atlas/cloud databases
    await mongoose.connect(uri, {
      dbName: 'doseflow',
      serverSelectionTimeoutMS: 15000
    });
    console.log(`[Database] Connected to MongoDB Atlas: ${mongoose.connection.host} (Database: ${mongoose.connection.name})`);
  } catch (err) {
    console.warn(`[Database] Could not connect to external MongoDB at ${uri}. (${err.message}) Falling back to In-Memory MongoDB for seamless execution...`);
    try {
      mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      await mongoose.connect(memUri);
      console.log(`[Database] Successfully connected to In-Memory MongoDB at ${memUri}`);
    } catch (memErr) {
      console.error('[Database] Failed to initialize In-Memory MongoDB:', memErr.message);
      process.exit(1);
    }
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};
