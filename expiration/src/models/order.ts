import mongoose from 'mongoose';
import { OrderStatus } from '@ticketing/common';

interface OrderAttrs {
  id: string;
  status: OrderStatus;
  userId: string;
  expiresAt: Date;
  ticket: {
    id: string;
    price: number;
  };
}

interface OrderDoc extends mongoose.Document {
  status: OrderStatus;
  userId: string;
  expiresAt: Date;
  ticket: {
    id: string;
    price: number;
  };
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
    },
    userId: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
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
  },
  {
    toJSON: {
      transform(doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order({
    _id: attrs.id,
    status: attrs.status,
    userId: attrs.userId,
    expiresAt: attrs.expiresAt,
    ticket: attrs.ticket,
  });
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };