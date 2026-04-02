import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { createGroup, getMyGroups } from "../controllers/groupController.js";

const groupRouter = express.Router();

groupRouter.post("/create", protectRoute, createGroup);
groupRouter.get("/all", protectRoute, getMyGroups);

export default groupRouter;