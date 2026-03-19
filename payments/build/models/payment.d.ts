import mongoose from 'mongoose';
interface PaymentAttrs {
    orderId: string;
    stripeId: string;
}
interface PaymentDoc extends mongoose.Document {
    orderId: string;
    stripeId: string;
}
interface PaymentModel extends mongoose.Model<PaymentDoc> {
    build(attrs: PaymentAttrs): PaymentDoc;
}
declare const Payment: PaymentModel;
export { Payment };
//# sourceMappingURL=payment.d.ts.map