import { ZodError } from "zod";
import { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error('---------------------');
    console.error(err); // Log the error for debugging

    if (res.headersSent) {
        return next(err); // If headers were already sent, delegate to Express
    }

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        res.status(400).json({
            error: "Validation Error",
            details: err.format() // Structured validation errors
        });
        return;
    }

    // Handle other types of errors
    res.status(500).json({
        error: err.message || "Something went wrong."
    });
};

