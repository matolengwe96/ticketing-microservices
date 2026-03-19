import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { TicketCreatedListener } from './events/ticket-created-listener';
import { OrderCancelledListener } from './events/order-cancelled-listener';
import { PaymentCreatedListener } from './events/payment-created-listener';
import dotenv from 'dotenv';

dotenv.config();

const start = async () => {
  console.log('Starting orders service...');

  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }

  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }

  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }

  try {
    const clientId = `${process.env.NATS_CLIENT_ID}-${Math.floor(
      Math.random() * 100000
    )}`;

    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      clientId,
      process.env.NATS_URL
    );

    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });

    new TicketCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error(err);
  }

  app.listen(process.env.PORT || 3002, () => {
    console.log(`Listening on port ${process.env.PORT || 3002}`);
  });
};

start();