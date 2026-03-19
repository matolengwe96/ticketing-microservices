import express, { Response } from 'express';
import { body } from 'express-validator';
import {
  validateRequest,
  requireAuth,
  AuthenticatedRequest,
  Subject,
  TicketCreatedEvent,
} from '@ticketing/common';
import { Ticket } from '../models/ticket';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/tickets',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),
  ],
  validateRequest,
  async (req: AuthenticatedRequest, res: Response) => {
    const { title, price } = req.body;

    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id,
    });

    await ticket.save();

    const event: TicketCreatedEvent = {
      subject: Subject.TicketCreated,
      data: {
        id: ticket._id.toString(),
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        version: ticket.version,
      },
    };

    natsWrapper.client.publish(
      Subject.TicketCreated,
      JSON.stringify(event.data),
      () => {
        res.status(201).send(ticket);
      }
    );
  }
);

export { router as createTicketRouter };