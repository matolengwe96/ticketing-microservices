import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { app } from './app';

dotenv.config();

const start = async () => {
  console.log('Starting auth service...');

  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error(err);
  }

  const port = process.env.PORT || 3001;

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
};

start();