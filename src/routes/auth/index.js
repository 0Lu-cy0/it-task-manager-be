//src/route/auth/index.js
import express from "express";
import { authRoute } from "./authRoute";
const Router = express.Router();

Router.use("/", authRoute);

export const APIs_auth = Router;
