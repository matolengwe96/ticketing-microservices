import express, { Request, Response } from 'express';
import {
  NotFoundError,
  NotAuthorizedError,
  requireAuth,
} from '@ticketing/common';
import { Order } from '../models/order';

interface AuthenticatedRequest extends Request {
  currentUser?: {
    id: string;
    email: string;
  };
}

const router = express.Router();

router.get(
  '/api/orders/:orderId',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('ticket');

    if (!order) {
      throw new NotFoundError();
    }

    if (!req.currentUser || order.userId !== req.currentUser.id) {
      throw new NotAuthorizedError();
    }

    res.send(order);
  }
);

export { router as showOrderRouter };