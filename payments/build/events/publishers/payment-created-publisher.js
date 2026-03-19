"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentCreatedPublisher = void 0;
const common_1 = require("@ticketing/common");
class PaymentCreatedPublisher extends common_1.Publisher {
    constructor() {
        super(...arguments);
        this.subject = common_1.Subject.PaymentCreated;
    }
}
exports.PaymentCreatedPublisher = PaymentCreatedPublisher;
//# sourceMappingURL=payment-created-publisher.js.map