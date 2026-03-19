import express, { Request, Response } from 'express';
import { NotAuthorizedError, requireAuth } from '@ticketing/common';
import { Order } from '../models/order';

interface AuthenticatedRequest extends Request {
  currentUser?: {
    id: string;
    email: string;
  };
}

const router = express.Router();

router.get(
  '/api/orders',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
if (!req.currentUser) {
    throw new NotAuthorizedError();
  }

  const orders = await Order.find({
      userId: req.currentUser.id,
    }).populate('ticket');

    res.send(orders);
  }
);

export { router as indexOrderRouter };