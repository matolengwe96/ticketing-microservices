"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const common_1 = require("@ticketing/common");
const orderSchema = new mongoose_1.default.Schema({
    status: {
        type: String,
        required: true,
        enum: Object.values(common_1.OrderStatus),
    },
    userId: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: mongoose_1.default.Schema.Types.Date,
    },
    ticket: {
        id: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
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
    return new Order({
        _id: attrs.id,
        status: attrs.status,
        userId: attrs.userId,
        expiresAt: attrs.expiresAt,
        ticket: attrs.ticket,
    });
};
const Order = mongoose_1.default.model('Order', orderSchema);
exports.Order = Order;
