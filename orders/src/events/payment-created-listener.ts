import { Message } from 'node-nats-streaming';
import { Listener, Subject, PaymentCreatedEvent, OrderStatus } from '@ticketing/common';
import { Order } from '../models/order';
import { natsWrapper } from '../nats-wrapper';
import { OrderUpdatedPublisher } from './publishers/order-updated-publisher';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subject.PaymentCreated = Subject.PaymentCreated;
  queueGroupName = 'orders-service';

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.Complete,
    });
    await order.save();

    await new OrderUpdatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      version: order.version,
      ticket: {
        id: order.ticket.id,
        price: order.ticket.price,
      },
    });

    msg.ack();
  }
}