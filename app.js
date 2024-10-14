import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import session from "express-session";
import fs from "fs";
import { createServer } from "http";
import passport from "passport";
import path from "path";
import requestIp from "request-ip";
import { fileURLToPath } from "url";
import YAML from "yaml";
import morganMiddleware from "./logger/morgan.logger.js";
import { ApiError } from "./utils/ApiError.js";

const app = express();

const httpServer = createServer(app);

// global middlewares
app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN === "*"
        ? "*" // This might give CORS error for some origins due to credentials set to true
        : process.env.CORS_ORIGIN?.split(","), // For multiple cors origin for production. Refer https://github.com/hiteshchoudhary/apihub/blob/a846abd7a0795054f48c7eb3e71f3af36478fa96/.env.sample#L12C1-L12C12
    credentials: true,
  })
);

app.use(requestIp.mw());

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // configure static file to save images locally
app.use(cookieParser());

// required for passport
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.use(morganMiddleware);
// api routes
import { errorHandler } from "./middlewares/error.middlewares.js";

// * App routes
import userRouter from "./routes/auth/user.routes.js";

import addressRouter from "./routes/ecommerce/address.routes.js";
import cartRouter from "./routes/ecommerce/cart.routes.js";
import categoryRouter from "./routes/ecommerce/category.routes.js";
import couponRouter from "./routes/ecommerce/coupon.routes.js";
import orderRouter from "./routes/ecommerce/order.routes.js";
import productRouter from "./routes/ecommerce/product.routes.js";
import ecomProfileRouter from "./routes/ecommerce/profile.routes.js";

// * App apis
app.use("/api/users", userRouter);

app.use("/api/ecommerce/categories", categoryRouter);
app.use("/api/ecommerce/addresses", addressRouter);
app.use("/api/ecommerce/products", productRouter);
app.use("/api/ecommerce/profile", ecomProfileRouter);
app.use("/api/ecommerce/cart", cartRouter);
app.use("/api/ecommerce/orders", orderRouter);
app.use("/api/ecommerce/coupons", couponRouter)

// // * API DOCS
// // ? Keeping swagger code at the end so that we can load swagger on "/" route
// app.use(
//   "/",
//   swaggerUi.serve,
//   swaggerUi.setup(swaggerDocument, {
//     swaggerOptions: {
//       docExpansion: "none", // keep all the sections collapsed by default
//     },
//   })
// );

// common error handling middleware
app.use(errorHandler);

export { httpServer };
