import { Message } from 'node-nats-streaming';
import { Listener, Subject, OrderUpdatedEvent, OrderStatus } from '@ticketing/common';
import { Ticket } from '../models/ticket';
import { natsWrapper } from '../nats-wrapper';
import { TicketUpdatedPublisher } from './publishers/ticket-updated-publisher';

export class OrderUpdatedListener extends Listener<OrderUpdatedEvent> {
  subject: Subject.OrderUpdated = Subject.OrderUpdated;
  queueGroupName = 'tickets-service';

  async onMessage(data: OrderUpdatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    if (data.status === OrderStatus.Complete) {
      ticket.set({ orderId: undefined });
    }

    await ticket.save();

    await new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId,
    });

    msg.ack();
  }
}