import { Router } from "express";
import { getProfileController } from "../use-cases/profile/get-profile/get-profile.controller";
import { updateProfileController } from "../use-cases/profile/update-profile/update-profile.controller";
import { authMiddleware } from "../middlewares/auth-middleware";

export const profileRoutes = Router();

// IMPORTANT: /me must come before /:id to avoid "me" being treated as an id
profileRoutes.patch("/me", authMiddleware, updateProfileController);
profileRoutes.get("/:id", authMiddleware, getProfileController);
