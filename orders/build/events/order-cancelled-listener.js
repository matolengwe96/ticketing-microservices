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
exports.OrderCancelledListener = void 0;
const common_1 = require("@ticketing/common");
const order_1 = require("../models/order");
const ticket_1 = require("../models/ticket");
const common_2 = require("@ticketing/common");
class OrderCancelledListener extends common_1.Listener {
    constructor() {
        super(...arguments);
        this.subject = common_1.Subject.OrderCancelled;
        this.queueGroupName = 'orders-service';
    }
    async onMessage(data, msg) {
        const order = await order_1.Order.findById(data.id).populate('ticket');
        if (!order) {
            throw new Error('Order not found');
        }
        if (order.status === common_2.OrderStatus.Complete) {
            msg.ack();
            return;
        }
        order.set({ status: common_2.OrderStatus.Cancelled });
        await order.save();
        // Update ticket to remove reservation
        const ticket = await ticket_1.Ticket.findById(order.ticket.id);
        if (!ticket) {
            throw new Error('Ticket not found');
        }
        ticket.set({ orderId: undefined, version: ticket.version + 1 });
        await ticket.save();
        // Publish ticket updated event
        const { natsWrapper } = await Promise.resolve().then(() => __importStar(require('../nats-wrapper')));
        const event = {
            subject: common_1.Subject.TicketUpdated,
            data: {
                id: ticket._id.toString(),
                title: ticket.title,
                price: ticket.price,
                userId: ticket.userId,
                version: ticket.version,
                orderId: ticket.orderId,
            },
        };
        natsWrapper.client.publish(common_1.Subject.TicketUpdated, JSON.stringify(event.data), () => {
            msg.ack();
        });
    }
}
exports.OrderCancelledListener = OrderCancelledListener;
