import express from 'express';

const app = express();
app.use(express.json());

app.get('/api/users/test', (req, res) => {
  res.send({ message: 'Auth service working 🚀' });
});

export { app };