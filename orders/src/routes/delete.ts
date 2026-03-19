import express, { Request, Response } from 'express';
import {
  NotFoundError,
  NotAuthorizedError,
  OrderStatus,
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

router.delete(
  '/api/orders/:orderId',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      throw new NotFoundError();
    }

    if (!req.currentUser || order.userId !== req.currentUser.id) {
      throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };