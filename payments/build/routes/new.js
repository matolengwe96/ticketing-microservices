"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChargeRouter = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const common_1 = require("@ticketing/common");
const stripe_1 = require("../stripe");
const payment_1 = require("../models/payment");
const order_1 = require("../models/order");
const payment_created_publisher_1 = require("../events/publishers/payment-created-publisher");
const nats_wrapper_1 = require("../nats-wrapper");
const router = express_1.default.Router();
exports.createChargeRouter = router;
router.post('/api/payments', common_1.requireAuth, [
    (0, express_validator_1.body)('token').not().isEmpty(),
    (0, express_validator_1.body)('orderId').not().isEmpty(),
], common_1.validateRequest, async (req, res) => {
    const { token, orderId } = req.body;
    const order = await order_1.Order.findById(orderId);
    if (!order) {
        throw new common_1.NotFoundError();
    }
    if (order.userId !== req.currentUser.id) {
        throw new common_1.NotAuthorizedError();
    }
    if (order.status === common_1.OrderStatus.Cancelled) {
        throw new common_1.BadRequestError('Cannot pay for an cancelled order');
    }
    const charge = await stripe_1.stripe.charges.create({
        currency: 'usd',
        amount: order.price * 100,
        source: token,
    });
    const payment = payment_1.Payment.build({
        orderId,
        stripeId: charge.id,
    });
    await payment.save();
    await new payment_created_publisher_1.PaymentCreatedPublisher(nats_wrapper_1.natsWrapper.client).publish({
        id: payment.id,
        orderId: payment.orderId,
        stripeId: payment.stripeId,
    });
    res.status(201).send({ id: payment.id });
});
//# sourceMappingURL=new.js.map