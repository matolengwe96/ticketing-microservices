import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  currentUser?: {
    id: string;
    email: string;
  };
}