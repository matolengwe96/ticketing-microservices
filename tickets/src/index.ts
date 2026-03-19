import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { TicketUpdatedListener } from './events/ticket-updated-listener';
import { OrderUpdatedListener } from './events/order-updated-listener';

dotenv.config();

const start = async () => {
  console.log('Starting tickets service...');

  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }

  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    new TicketUpdatedListener(natsWrapper.client).listen();
    new OrderUpdatedListener(natsWrapper.client).listen();
  } catch (err) {
    console.error(err);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error(err);
  }

  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
};

start();