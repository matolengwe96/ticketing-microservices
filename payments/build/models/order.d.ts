import mongoose from 'mongoose';
import { OrderStatus } from '@ticketing/common';
interface OrderAttrs {
    id: string;
    version: number;
    status: OrderStatus;
    userId: string;
    price: number;
}
interface OrderDoc extends mongoose.Document {
    version: number;
    status: OrderStatus;
    userId: string;
    price: number;
}
interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc;
}
declare const Order: OrderModel;
export { Order };
//# sourceMappingURL=order.d.ts.map