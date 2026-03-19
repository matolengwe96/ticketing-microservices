"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketCreatedListener = void 0;
const common_1 = require("@ticketing/common");
const ticket_1 = require("../models/ticket");
class TicketCreatedListener extends common_1.Listener {
    constructor() {
        super(...arguments);
        this.subject = common_1.Subject.TicketCreated;
        this.queueGroupName = 'orders-service';
    }
    async onMessage(data, msg) {
        const { id, title, price, userId, version } = data;
        const ticket = ticket_1.Ticket.build({
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
exports.TicketCreatedListener = TicketCreatedListener;
