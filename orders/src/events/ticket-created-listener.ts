import { Message } from 'node-nats-streaming';
import { Listener, Subject, TicketCreatedEvent } from '@ticketing/common';
import { Ticket } from '../models/ticket';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subject.TicketCreated = Subject.TicketCreated;
  queueGroupName = 'orders-service';

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const { id, title, price, userId, version } = data;

    const ticket = Ticket.build({
      id,
      title,
      price,
      userId,
      version,
    });

    await ticket.save();

    msg.ack();
  }
}
