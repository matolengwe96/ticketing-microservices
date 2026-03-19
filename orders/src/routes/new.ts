import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
  Subject,
  TicketUpdatedEvent,
  OrderCreatedEvent,
} from '@ticketing/common';

import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { natsWrapper } from '../nats-wrapper';

interface AuthenticatedRequest extends Request {
  currentUser?: {
    id: string;
    email: string;
  };
}

const router = express.Router();

router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      .withMessage('TicketId must be provided'),
  ],
  validateRequest,
  async (req: AuthenticatedRequest, res: Response) => {
    const { ticketId } = req.body;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new NotFoundError();
    }

    const isReserved = await ticket.isReserved();

    if (isReserved) {
      throw new BadRequestError('Ticket is already reserved');
    }

    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + 15 * 60); // 15 minutes

    if (!req.currentUser) {
      throw new NotAuthorizedError();
    }

    const order = Order.build({
      userId: req.currentUser.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    });

    await order.save();

    // Update ticket with orderId
    ticket.set({ orderId: order.id, version: ticket.version + 1 });
    await ticket.save();

    // Publish ticket updated event
    const ticketEvent: TicketUpdatedEvent = {
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

    // Publish order created event
    const orderEvent: OrderCreatedEvent = {
      subject: Subject.OrderCreated,
      data: {
        id: order.id,
        version: 0, // We'll add version tracking later if needed
        status: OrderStatus.Created,
        userId: order.userId,
        expiresAt: order.expiresAt.toISOString(),
        ticket: {
          id: order.ticket._id.toString(),
          price: order.ticket.price,
        },
      },
    };

    natsWrapper.client.publish(
      Subject.TicketUpdated,
      JSON.stringify(ticketEvent.data),
      () => {
        natsWrapper.client.publish(
          Subject.OrderCreated,
          JSON.stringify(orderEvent.data),
          () => {
            res.status(201).send(order);
          }
        );
      }
    );
  }
);

export { router as createOrderRouter };