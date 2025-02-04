// Dependencies
import express, { json } from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet"; // For added security
import { router } from "./routes/routes";
import { errorHandler } from "./middlewares/error_handler";
import { route_not_found } from "./controllers/controller";

// Instantiations
const app = express();

// Configurations
app.disable("x-powered-by");

// Middleware
app.use(helmet()); // Secure HTTP headers
app.use(morgan("combined")); // Use 'combined' for more detailed logging
app.use(cors()); // Allow cross-origin requests
app.use(json()); // Parse JSON payloads

// Routes
app.use("/", router);
app.use(route_not_found);

// Error Handling
app.use(errorHandler);

export default app;
