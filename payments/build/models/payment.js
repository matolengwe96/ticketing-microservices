"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const paymentSchema = new mongoose_1.default.Schema({
    orderId: {
        required: true,
        type: String,
    },
    stripeId: {
        required: true,
        type: String,
    },
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        },
    },
});
paymentSchema.statics.build = (attrs) => {
    return new Payment(attrs);
};
const Payment = mongoose_1.default.model('Payment', paymentSchema);
exports.Payment = Payment;
//# sourceMappingURL=payment.js.map