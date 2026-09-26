// Adicione aqui extensões do tipo Request do Express

import "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string;
      sessionId: string;
    };
  }
}
