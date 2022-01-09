import { Schema, model } from "mongoose";
const orderItemSchema = new Schema({
  orderId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  foodId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
});
export const OrderItem = model("OrderItem", orderItemSchema, "OrderItem");
