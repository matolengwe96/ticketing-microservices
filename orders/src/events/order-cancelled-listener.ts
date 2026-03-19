import { Message } from 'node-nats-streaming';
import { Listener, Subject, OrderCancelledEvent, TicketUpdatedEvent } from '@ticketing/common';
import { Order } from '../models/order';
import { Ticket } from '../models/ticket';
import { OrderStatus } from '@ticketing/common';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subject.OrderCancelled = Subject.OrderCancelled;
  queueGroupName = 'orders-service';

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const order = await Order.findById(data.id).populate('ticket');

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === OrderStatus.Complete) {
      msg.ack();
      return;
    }

    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    // Update ticket to remove reservation
    const ticket = await Ticket.findById(order.ticket.id);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.set({ orderId: undefined, version: ticket.version + 1 });
    await ticket.save();

    // Publish ticket updated event
    const { natsWrapper } = await import('../nats-wrapper');

    const event: TicketUpdatedEvent = {
      subject: Subject.TicketUpdated,
      data: {
        id: ticket._id.toString(),
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        version: ticket.version,
        orderId: ticket.orderId,
      },
    };

    natsWrapper.client.publish(
      Subject.TicketUpdated,
      JSON.stringify(event.data),
      () => {
        msg.ack();
      }
    );
  }
}