import { Router } from "express";
import { registerController } from "../use-cases/auth/register/register.controller";
import { loginController } from "../use-cases/auth/login/login.controller";
import { logoutController } from "../use-cases/auth/logout/logout.controller";
import { meController } from "../use-cases/auth/me/me.controller";
import { authMiddleware } from "../middlewares/auth-middleware";

export const authRoutes = Router();

authRoutes.post("/register", registerController);
authRoutes.post("/login", loginController);
authRoutes.post("/logout", authMiddleware, logoutController);
authRoutes.get("/me", authMiddleware, meController);
