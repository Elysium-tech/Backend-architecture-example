// Adicione aqui extensões do tipo Request do Express
// Exemplo: adicionar o usuário autenticado na requisição

import "express";

declare module "express-serve-static-core" {
  interface Request {
    // user?: { id: string; role: string };
  }
}
