import { IOrder } from "./IOrder"
import { IOrderItem } from "./IOrderItem"

export interface IPayload{
    order_id: number
    order_items:IOrderItem[]
  }


  /* export interface IOrderItem extends RowDataPacket {
    id: number | null
    order_id: number
    product_id: number
    product_name: string
    quantity: number
    unit_price: number
    created_at: string
  } */