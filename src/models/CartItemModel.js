import { Schema, model } from "mongoose";
const cartItemSchema = new Schema({
  customerId: {
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
export const CartItem = model("CartItem", cartItemSchema, "CartItem");
