// import express from "express";
// import { connectDB, db } from "./config/db";
// import cookieParser from 'cookie-parser';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import { Request, Response } from "express";
// import { IOrderItem } from "./models/IOrderItem";
// import { FieldPacket, ResultSetHeader } from "mysql2";
// import { logError } from "./utilities/logger";


// import { STRIPE_SECRET_KEY } from "./constants/env";


// dotenv.config();

// const app = express();
// app.use('/stripe/webhook', stripeWebhook);
// app.use(express.json());
// app.use(cookieParser());
// app.use(cors({
//   origin: "*",  // tillåt alla domäner för nu, justera för säkerhet senare(auth)
//   credentials: true
// }));

// // Routes
// import productRouter from "./routes/products";
// import customerRouter from "./routes/customers";
// import orderRouter from "./routes/orders";
// import orderItemRouter from "./routes/orderItems";
// import authRouter from "./routes/auth";
// import { VercelRequest, VercelResponse } from "@vercel/node";
// import { DB_PORT } from "./constants/env";
// import { stripeWebhook } from "./routes/stripeWebhook";


// app.use('/products', productRouter);
// app.use('/customers', customerRouter);
// app.use('/orders', orderRouter);
// app.use('/order-items', orderItemRouter);
// app.use('/auth', authRouter);

// // Stripe Setup
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// app.post('/stripe/create-checkout-session-embedded', async (req: Request, res: Response) => {
//   try {
//     const { order_id, order_items }: { order_id: string, order_items: IOrderItem[] } = req.body;
//     const session = await stripe.checkout.sessions.create({
//       line_items: order_items.map((item) => ({
//         price_data: {
//           currency: 'sek',
//           product_data: {
//             name: item.product_name,
//           },
//           unit_amount: item.unit_price * 100, // Stripe kräver belopp i öre
//         },
//         quantity: item.quantity,
//       })),
//       mode: 'payment',
//       return_url: 'https://ecommerce-live-client.vercel.app/order-confirmation?session_id={CHECKOUT_SESSION_ID}',
//       client_reference_id: String(order_id),
//     });

//     res.send({ clientSecret: session.client_secret });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: logError(error) });
//   }
// });

// // Stripe Webhook
// app.post('/stripe/webhook', async (req: Request, res: Response) => {
//   const event = req.body;
  
//   // Handle the event
//   switch (event.type) {
//     case 'checkout.session.completed':
//       const session = event.data.object;
    
//       console.log(session);
//       try {
//     const sql = `
//       UPDATE orders 
//       SET payment_status = ?, payment_id = ?,order_status = ?
//       WHERE id = ?
//     `;
//     const payment_status = "Paid";
//         const payment_id = session.id;
//         const order_status = "Received";
//         const id = session.client_reference_id; // t.ex. om du sparade order-id i metadata

//         const [result] = await db.query<ResultSetHeader>(sql, [
//           payment_status,
//           payment_id,
//           order_status,
//           id
//         ]);




//         const orderItemsQuery = `
//         SELECT * FROM order_items WHERE order_id = ?
//       `;
//       const [orderItems]:[IOrderItem[], FieldPacket[]] = await db.query(orderItemsQuery, [id]);
  
//       // Uppdatera lagerstatus för varje produkt i ordern
//       for (const item of orderItems) {
//         const productId = item.product_id;
//         const quantitySold = item.quantity;
  
//         const sqlUpdateProduct = `
//           UPDATE products 
//           SET stock = stock - ? 
//           WHERE id = ?
//         `;
  
//         // Kör SQL-frågan för att uppdatera produktens lager
//          await db.query<ResultSetHeader>(sqlUpdateProduct, [
//           quantitySold,
//           productId
//         ]);
//          }

//     result.affectedRows === 0
//       ? res.status(404).json({message: 'Order not found'})
//       : res.json({message: 'Order updated'});
//       return;
//   } catch(error) {
//     res.status(500).json({error: logError(error)})
//   }
  
//       console.log(event.type.object);
//       break;
//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

//   res.json({received: true});
// });








import express from "express";
import {connectDB} from "./config/db";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { VercelRequest, VercelResponse } from "@vercel/node";

import dotenv from 'dotenv';
dotenv.config();
const app = express();

// Middleware
app.use(express.json())
app.use(cookieParser());
app.use(cors({
  // origin: "http://localhost:5173",
  origin: "*",
  credentials: true,  // ✅ Allows cookies
}));

// Routes
import productRouter from "./routes/products";
import customerRouter from "./routes/customers";
import orderRouter from "./routes/orders";
import orderItemRouter from "./routes/orderItems";
import stripeRouter from "./routes/stripe";
import authRouter from "./routes/auth";
import { DB_PORT } from "./constants/env";
app.use('/products', productRouter)
app.use('/customers', customerRouter)
app.use('/orders', orderRouter)
app.use('/order-items', orderItemRouter)
app.use('/stripe', stripeRouter)
app.use('/auth', authRouter)





// Connect to DB
connectDB();

// Start server

app.listen(DB_PORT, () => {
  console.log(`The server is running at https://ecommerce-live-api-new.vercel.app`);
});












export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};
