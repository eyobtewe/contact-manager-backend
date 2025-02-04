// Dependencies
import express, { json } from "express";
import morgan from "morgan";
import cors from "cors";
import { router } from "./routes/routes";
import { errorHandler } from "./middlewares/error_handler";
import { route_not_found } from "./controllers/controller";

// Instantiations
const app = express();

// Configurations
app.disable('x-powered-by');

// Middleware
app.use(morgan(`dev`))
  .use(cors())
  .use(json());

// Routes
app.use(`/`, router);
app.use(route_not_found);


// Error Handling
app.use(errorHandler);

// server
export default app;