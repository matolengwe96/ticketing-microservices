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
    expiration.setSeconds(expiration.getSeconds() + 15 * 60);
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
    res.status(201).send(order);
});
