"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentCreatedListener = void 0;
const common_1 = require("@ticketing/common");
const order_1 = require("../models/order");
const nats_wrapper_1 = require("../nats-wrapper");
const order_updated_publisher_1 = require("./publishers/order-updated-publisher");
class PaymentCreatedListener extends common_1.Listener {
    constructor() {
        super(...arguments);
        this.subject = common_1.Subject.PaymentCreated;
        this.queueGroupName = 'orders-service';
    }
    async onMessage(data, msg) {
        const order = await order_1.Order.findById(data.orderId);
        if (!order) {
            throw new Error('Order not found');
        }
        order.set({
            status: common_1.OrderStatus.Complete,
        });
        await order.save();
        await new order_updated_publisher_1.OrderUpdatedPublisher(nats_wrapper_1.natsWrapper.client).publish({
            id: order.id,
            status: order.status,
            userId: order.userId,
            expiresAt: order.expiresAt.toISOString(),
            version: order.version,
            ticket: {
                id: order.ticket.id,
                price: order.ticket.price,
            },
        });
        msg.ack();
    }
}
exports.PaymentCreatedListener = PaymentCreatedListener;
