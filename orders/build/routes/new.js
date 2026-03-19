"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderRouter = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const common_1 = require("@ticketing/common");
const ticket_1 = require("../models/ticket");
const order_1 = require("../models/order");
const nats_wrapper_1 = require("../nats-wrapper");
const router = express_1.default.Router();
exports.createOrderRouter = router;
router.post('/api/orders', common_1.requireAuth, [
    (0, express_validator_1.body)('ticketId')
        .not()
        .isEmpty()
        .withMessage('TicketId must be provided'),
], common_1.validateRequest, async (req, res) => {
    const { ticketId } = req.body;
    const ticket = await ticket_1.Ticket.findById(ticketId);
    if (!ticket) {
        throw new common_1.NotFoundError();
    }
    const isReserved = await ticket.isReserved();
    if (isReserved) {
        throw new common_1.BadRequestError('Ticket is already reserved');
    }
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + 15 * 60); // 15 minutes
    if (!req.currentUser) {
        throw new common_1.NotAuthorizedError();
    }
    const order = order_1.Order.build({
        userId: req.currentUser.id,
        status: common_1.OrderStatus.Created,
        expiresAt: expiration,
        ticket,
    });
    await order.save();
    // Update ticket with orderId
    ticket.set({ orderId: order.id, version: ticket.version + 1 });
    await ticket.save();
    // Publish ticket updated event
    const ticketEvent = {
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
    // Publish order created event
    const orderEvent = {
        subject: common_1.Subject.OrderCreated,
        data: {
            id: order.id,
            version: 0, // We'll add version tracking later if needed
            status: common_1.OrderStatus.Created,
            userId: order.userId,
            expiresAt: order.expiresAt.toISOString(),
            ticket: {
                id: order.ticket._id.toString(),
                price: order.ticket.price,
            },
        },
    };
    nats_wrapper_1.natsWrapper.client.publish(common_1.Subject.TicketUpdated, JSON.stringify(ticketEvent.data), () => {
        nats_wrapper_1.natsWrapper.client.publish(common_1.Subject.OrderCreated, JSON.stringify(orderEvent.data), () => {
            res.status(201).send(order);
        });
    });
});
