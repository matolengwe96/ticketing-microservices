"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrderRouter = void 0;
const express_1 = __importDefault(require("express"));
const common_1 = require("@ticketing/common");
const order_1 = require("../models/order");
const router = express_1.default.Router();
exports.deleteOrderRouter = router;
router.delete('/api/orders/:orderId', common_1.requireAuth, async (req, res) => {
    const order = await order_1.Order.findById(req.params.orderId);
    if (!order) {
        throw new common_1.NotFoundError();
    }
    if (!req.currentUser || order.userId !== req.currentUser.id) {
        throw new common_1.NotAuthorizedError();
    }
    order.status = common_1.OrderStatus.Cancelled;
    await order.save();
    res.status(204).send(order);
});
