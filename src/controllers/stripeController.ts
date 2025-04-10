import { Request, Response } from "express";
import { db } from "../config/db";
import { STRIPE_SECRET_KEY } from "../constants/env";
import { IOrderItem } from "../models/IOrderItem";
import { logError } from "../utilities/logger";
import { FieldPacket, ResultSetHeader } from "mysql2";
const stripe = require('stripe')(STRIPE_SECRET_KEY);
//----------uppe är koden från Sibar-----------------


export const checkoutSessionHosted = async  (req: Request, res: Response) => {
}

export const checkoutSessionEmbedded = async (req: Request, res: Response) => {
    try {
      const { order_id, order_items }: { order_id: string, order_items: IOrderItem[] } = req.body;
      const session = await stripe.checkout.sessions.create({
        line_items: order_items.map((item) => ({
          price_data: {
            currency: 'sek',
            product_data: {
              name: item.product_name,
            },
            unit_amount: item.unit_price * 100, // Stripe kräver belopp i öre
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        return_url: 'https://ecommerce-live-client.vercel.app/order-confirmation?session_id={CHECKOUT_SESSION_ID}',
        client_reference_id: String(order_id),
      });
    
      res.send({ clientSecret: session.client_secret });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: logError(error) });
    }
};

export const webhook = async (req: Request, res: Response) => {
    
        const event = req.body;
        
        // Handle the event
        switch (event.type) {
          case 'checkout.session.completed':
            const session = event.data.object;
          
            console.log(session);
            try {
          const sql = `
            UPDATE orders 
            SET payment_status = ?, payment_id = ?,order_status = ?
            WHERE id = ?
          `;
          const payment_status = "Paid";
              const payment_id = session.id;
              const order_status = "Received";
              const id = session.client_reference_id; // t.ex. om du sparade order-id i metadata
      
              const [result] = await db.query<ResultSetHeader>(sql, [
                payment_status,
                payment_id,
                order_status,
                id
              ]);
      
      
      
      
              const orderItemsQuery = `
              SELECT * FROM order_items WHERE order_id = ?
            `;
            const [orderItems]:[IOrderItem[], FieldPacket[]] = await db.query(orderItemsQuery, [id]);
        
            // Uppdatera lagerstatus för varje produkt i ordern
            for (const item of orderItems) {
              const productId = item.product_id;
              const quantitySold = item.quantity;
        
              const sqlUpdateProduct = `
                UPDATE products 
                SET stock = stock - ? 
                WHERE id = ?
              `;
        
              // Kör SQL-frågan för att uppdatera produktens lager
               await db.query<ResultSetHeader>(sqlUpdateProduct, [
                quantitySold,
                productId
              ]);
               }
      
      
      
      
              
      
          result.affectedRows === 0
            ? res.status(404).json({message: 'Order not found'})
            : res.json({message: 'Order updated'});
            return;
        } catch(error) {
          res.status(500).json({error: logError(error)})
        }
            
            // Update order with confirmed payment
            // -- payment_status = "Paid"
            // -- payment_id = session.id
            // -- order_status = "Received"
      
            // Update product stock
      
            // Send confirmation email to customer
      
            // Sen purchase to accounting service
            console.log(event.type.object);
            break;
          default:
            console.log(`Unhandled event type ${event.type}`);
        }
      
        // Return a response to acknowledge receipt of the event
        res.json({received: true});
      }
