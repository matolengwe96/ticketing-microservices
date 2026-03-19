import { Message } from 'node-nats-streaming';
import { Listener, Subject, OrderCreatedEvent, OrderCancelledEvent } from '@ticketing/common';
import { Order } from '../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subject.OrderCreated = Subject.OrderCreated;
  queueGroupName = 'expiration-service';

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log('Waiting this many milliseconds to process the job:', delay);

    // Save the order to our database
    const order = Order.build({
      id: data.id,
      status: data.status,
      userId: data.userId,
      expiresAt: new Date(data.expiresAt),
      ticket: data.ticket,
    });
    await order.save();

    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    // Check if order still exists and is in created status
    const existingOrder = await Order.findById(data.id);

    if (!existingOrder) {
      console.log('Order not found, skipping expiration');
      msg.ack();
      return;
    }

    if (existingOrder.status !== data.status) {
      console.log('Order status changed, skipping expiration');
      msg.ack();
      return;
    }

    // Order has expired, publish cancellation event
    const { natsWrapper } = await import('../nats-wrapper');

    const event: OrderCancelledEvent = {
      subject: Subject.OrderCancelled,
      data: {
        id: existingOrder.id,
        version: 0, // We'll add version tracking later if needed
        status: existingOrder.status as any, // This will be cancelled
        userId: existingOrder.userId,
        ticket: {
          id: existingOrder.ticket.id,
        },
      },
    };

    natsWrapper.client.publish(
      Subject.OrderCancelled,
      JSON.stringify(event.data),
      () => {
        console.log('Order cancellation event published');
        msg.ack();
      }
    );
  }
}