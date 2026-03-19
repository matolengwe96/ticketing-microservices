import { Publisher, Subject, OrderUpdatedEvent } from '@ticketing/common';

export class OrderUpdatedPublisher extends Publisher<OrderUpdatedEvent> {
  subject: Subject.OrderUpdated = Subject.OrderUpdated;
}