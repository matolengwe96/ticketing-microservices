import express from 'express';
import 'express-async-errors';
import { errorHandler } from '@ticketing/common';

import { createTicketRouter } from './routes/new';
import { indexTicketRouter } from './routes/index';
import { showTicketRouter } from './routes/show';

const app = express();

app.use(express.json());

app.get('/api/tickets/test', (req, res) => {
  res.send({ message: 'Tickets service working' });
});

app.use(createTicketRouter);
app.use(indexTicketRouter);
app.use(showTicketRouter);

app.use(errorHandler);

export { app };