"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const order_status_1 = require("./order-status");
const orderSchema = new mongoose_1.default.Schema({
    userId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: Object.values(order_status_1.OrderStatus),
        default: order_status_1.OrderStatus.Created,
    },
    expiresAt: {
        type: mongoose_1.default.Schema.Types.Date,
    },
    ticket: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Ticket',
    },
    version: {
        type: Number,
        required: true,
        default: 0,
    },
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        },
    },
});
orderSchema.statics.build = (attrs) => {
    return new Order(attrs);
};
const Order = mongoose_1.default.model('Order', orderSchema);
exports.Order = Order;
