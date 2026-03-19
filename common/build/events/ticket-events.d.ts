import { Subject } from './subjects';
export interface TicketCreatedEvent {
    subject: Subject.TicketCreated;
    data: {
        id: string;
        title: string;
        price: number;
        userId: string;
        version: number;
    };
}
export interface TicketUpdatedEvent {
    subject: Subject.TicketUpdated;
    data: {
        id: string;
        title: string;
        price: number;
        userId: string;
        version: number;
        orderId?: string;
    };
}
