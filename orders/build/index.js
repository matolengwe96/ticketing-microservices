"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = require("./app");
const nats_wrapper_1 = require("./nats-wrapper");
const ticket_created_listener_1 = require("./events/ticket-created-listener");
const order_cancelled_listener_1 = require("./events/order-cancelled-listener");
const payment_created_listener_1 = require("./events/payment-created-listener");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
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
        const clientId = `${process.env.NATS_CLIENT_ID}-${Math.floor(Math.random() * 100000)}`;
        await nats_wrapper_1.natsWrapper.connect(process.env.NATS_CLUSTER_ID, clientId, process.env.NATS_URL);
        nats_wrapper_1.natsWrapper.client.on('close', () => {
            console.log('NATS connection closed!');
            process.exit();
        });
        new ticket_created_listener_1.TicketCreatedListener(nats_wrapper_1.natsWrapper.client).listen();
        new order_cancelled_listener_1.OrderCancelledListener(nats_wrapper_1.natsWrapper.client).listen();
        new payment_created_listener_1.PaymentCreatedListener(nats_wrapper_1.natsWrapper.client).listen();
        process.on('SIGINT', () => nats_wrapper_1.natsWrapper.client.close());
        process.on('SIGTERM', () => nats_wrapper_1.natsWrapper.client.close());
        await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
    }
    catch (err) {
        console.error(err);
    }
    app_1.app.listen(process.env.PORT || 3002, () => {
        console.log(`Listening on port ${process.env.PORT || 3002}`);
    });
};
start();
