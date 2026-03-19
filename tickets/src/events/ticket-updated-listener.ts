import { Message } from 'node-nats-streaming';
import { Listener, Subject, TicketUpdatedEvent } from '@ticketing/common';
import { Ticket } from '../models/ticket';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subject.TicketUpdated = Subject.TicketUpdated;
  queueGroupName = 'tickets-service';

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const { id, title, price, userId, version, orderId } = data;

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Check for version conflict (optimistic concurrency)
    if (ticket.version !== version - 1) {
      throw new Error('Ticket version conflict');
    }

    ticket.set({
      title,
      price,
      userId,
      version,
      orderId,
    });

    await ticket.save();

    msg.ack();
  }
}