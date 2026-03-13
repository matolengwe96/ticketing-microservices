import express from 'express';

const app = express();
app.use(express.json());

app.get('/api/tickets/test', (req, res) => {
  res.send({ message: 'Tickets service working' });
});

export { app };