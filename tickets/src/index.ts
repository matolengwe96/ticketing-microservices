import mongoose from 'mongoose';
import { app } from './app';

const start = async () => {
  console.log('Starting tickets service...');

  try {
    await mongoose.connect('mongodb://localhost:27018/tickets');
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error(err);
  }

  app.listen(3001, () => {
    console.log('Listening on port 3001');
  });
};

start();