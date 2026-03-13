import express from 'express';
import cookieSession from 'cookie-session';
import { signupRouter } from './routes/signup';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { currentUserRouter } from './routes/current-user';

const app = express();

app.use(express.json());

app.use(
  cookieSession({
    signed: false,
    secure: false
  })
);

app.use(signupRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(currentUserRouter);

export { app };