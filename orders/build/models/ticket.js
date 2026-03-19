"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticket = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const order_status_1 = require("./order-status");
const order_1 = require("./order");
const ticketSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    orderId: {
        type: String,
    },
    version: {
        type: Number,
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
ticketSchema.statics.build = (attrs) => {
    return new Ticket({
        _id: attrs.id,
        title: attrs.title,
        price: attrs.price,
        userId: attrs.userId,
        version: attrs.version,
        orderId: attrs.orderId,
    });
};
ticketSchema.methods.isReserved = async function () {
    const existingOrder = await order_1.Order.findOne({
        ticket: this,
        status: {
            $in: [
                order_status_1.OrderStatus.Created,
                order_status_1.OrderStatus.AwaitingPayment,
                order_status_1.OrderStatus.Complete,
            ],
        },
    });
    return !!existingOrder;
};
const Ticket = mongoose_1.default.model('Ticket', ticketSchema);
exports.Ticket = Ticket;
