import mongoose from 'mongoose';
import { app } from './app';

const start = async () => {
  console.log('Starting auth service...');

  try {
    await mongoose.connect('mongodb://localhost:27017/auth');
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000');
  });
};

start();