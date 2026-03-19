"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderUpdatedPublisher = void 0;
const common_1 = require("@ticketing/common");
class OrderUpdatedPublisher extends common_1.Publisher {
    constructor() {
        super(...arguments);
        this.subject = common_1.Subject.OrderUpdated;
    }
}
exports.OrderUpdatedPublisher = OrderUpdatedPublisher;
