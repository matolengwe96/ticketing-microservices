"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderCreatedListener = void 0;
const common_1 = require("@ticketing/common");
const order_1 = require("../models/order");
class OrderCreatedListener extends common_1.Listener {
    constructor() {
        super(...arguments);
        this.subject = common_1.Subject.OrderCreated;
        this.queueGroupName = 'expiration-service';
    }
    async onMessage(data, msg) {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        console.log('Waiting this many milliseconds to process the job:', delay);
        // Save the order to our database
        const order = order_1.Order.build({
            id: data.id,
            status: data.status,
            userId: data.userId,
            expiresAt: new Date(data.expiresAt),
            ticket: data.ticket,
        });
        await order.save();
        if (delay > 0) {
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
        // Check if order still exists and is in created status
        const existingOrder = await order_1.Order.findById(data.id);
        if (!existingOrder) {
            console.log('Order not found, skipping expiration');
            msg.ack();
            return;
        }
        if (existingOrder.status !== data.status) {
            console.log('Order status changed, skipping expiration');
            msg.ack();
            return;
        }
        // Order has expired, publish cancellation event
        const { natsWrapper } = await Promise.resolve().then(() => __importStar(require('../nats-wrapper')));
        const event = {
            subject: common_1.Subject.OrderCancelled,
            data: {
                id: existingOrder.id,
                version: 0, // We'll add version tracking later if needed
                status: existingOrder.status, // This will be cancelled
                userId: existingOrder.userId,
                ticket: {
                    id: existingOrder.ticket.id,
                },
            },
        };
        natsWrapper.client.publish(common_1.Subject.OrderCancelled, JSON.stringify(event.data), () => {
            console.log('Order cancellation event published');
            msg.ack();
        });
    }
}
exports.OrderCreatedListener = OrderCreatedListener;
