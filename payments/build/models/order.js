"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const common_1 = require("@ticketing/common");
const orderSchema = new mongoose_1.default.Schema({
    _id: {
        type: String,
        required: true,
    },
    version: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: Object.values(common_1.OrderStatus),
    },
    userId: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
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
//# sourceMappingURL=order.js.map