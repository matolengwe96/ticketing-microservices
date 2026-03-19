import { Subject } from './subjects';
import { OrderStatus } from './order-status';

export interface OrderCreatedEvent {
  subject: Subject.OrderCreated;
  data: {
    id: string;
    version: number;
    status: OrderStatus.Created;
    userId: string;
    expiresAt: string;
    ticket: {
      id: string;
      price: number;
    };
  };
}

export interface OrderCancelledEvent {
  subject: Subject.OrderCancelled;
  data: {
    id: string;
    version: number;
    status: OrderStatus.Cancelled;
    userId: string;
    ticket: {
      id: string;
    };
  };
}

export interface OrderUpdatedEvent {
  subject: Subject.OrderUpdated;
  data: {
    id: string;
    status: OrderStatus;
    userId: string;
    expiresAt: string;
    version: number;
    ticket: {
      id: string;
      price: number;
    };
  };
}