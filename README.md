# TicketHub Microservices

A microservices ticket marketplace built with Node.js, TypeScript, and NATS Streaming.

## Overview

This system is split into independent services that communicate using asynchronous events through NATS. Each service owns its own data and business rules.

Core architecture patterns used:

- Event-driven communication with publish/subscribe
- Service-level database ownership
- Optimistic concurrency control for order and ticket updates
- Shared package for common middleware, errors, and event contracts

## Services

- `auth`: signup, signin, signout, and current user identity
- `tickets`: ticket creation and listing
- `orders`: ticket reservation and order lifecycle
- `payments`: Stripe charge processing and payment recording
- `expiration`: order timeout processing and cancellation
- `common`: shared TypeScript package with errors, middleware, and event types

## Event Flow

- `tickets` publishes ticket events when tickets are created/updated
- `orders` listens to ticket events and publishes order events
- `expiration` listens for order creation and publishes cancellation when time expires
- `payments` listens/queries order state, creates Stripe charge, then publishes payment events
- `orders` listens to payment events, marks orders complete, and publishes updated order events
- `tickets` listens to order update/cancel events to set/clear reservations

## Architecture Diagram

The diagram below renders directly on GitHub. For full interactive editing, open [docs/architecture.drawio](docs/architecture.drawio) in [diagrams.net](https://app.diagrams.net) via **File → Import From → Device**.

```mermaid
flowchart TD
    User([User])
    StripeAPI([Stripe API])

    subgraph Services[ ]
        Auth["Auth Service\n:3001"]
        Tickets["Tickets Service\n:3000"]
        Orders["Orders Service\n:3002"]
        Payments["Payments Service\n:3004"]
        Expiration["Expiration Service\n:3003"]
    end

    NATS{{"NATS Streaming\nEvent Bus"}}

    AuthDB[(Auth DB)]
    TicketsDB[(Tickets DB)]
    OrdersDB[(Orders DB)]
    PaymentsDB[(Payments DB)]

    User -->|HTTP| Auth
    User -->|HTTP| Tickets
    User -->|HTTP| Orders
    User -->|HTTP| Payments
    Payments -->|Charge API| StripeAPI

    Auth --- AuthDB
    Tickets --- TicketsDB
    Orders --- OrdersDB
    Payments --- PaymentsDB

    Tickets -.->|"TicketCreated / TicketUpdated"| NATS
    NATS -.->|"TicketCreated / TicketUpdated"| Orders

    Orders -.->|OrderCreated| NATS
    NATS -.->|OrderCreated| Expiration
    Expiration -.->|OrderCancelled| NATS
    NATS -.->|OrderCancelled| Orders

    Payments -.->|PaymentCreated| NATS
    NATS -.->|PaymentCreated| Orders

    Orders -.->|"OrderUpdated / OrderCancelled"| NATS
    NATS -.->|"OrderUpdated / OrderCancelled"| Tickets
```

> Solid arrows = synchronous HTTP calls. Dashed arrows = async NATS events.
