import { Message, Stan, SubscriptionOptions } from 'node-nats-streaming';
import { Event } from './base-event';
export declare abstract class Listener<T extends Event> {
    abstract subject: T['subject'];
    abstract queueGroupName: string;
    protected client: Stan;
    protected ackWait: number;
    constructor(client: Stan);
    subscriptionOptions(): SubscriptionOptions;
    listen(): void;
    parseMessage(msg: Message): any;
    abstract onMessage(data: T['data'], msg: Message): void;
}
export declare abstract class Publisher<T extends Event> {
    abstract subject: T['subject'];
    private client;
    constructor(client: Stan);
    publish(data: T['data']): Promise<void>;
}
