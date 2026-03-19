"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexOrderRouter = void 0;
const express_1 = __importDefault(require("express"));
const common_1 = require("@ticketing/common");
const order_1 = require("../models/order");
const router = express_1.default.Router();
exports.indexOrderRouter = router;
router.get('/api/orders', common_1.requireAuth, async (req, res) => {
    if (!req.currentUser) {
        throw new common_1.NotAuthorizedError();
    }
    const orders = await order_1.Order.find({
        userId: req.currentUser.id,
    }).populate('ticket');
    res.send(orders);
});
