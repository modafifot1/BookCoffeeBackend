import { Schema, model } from "mongoose";
const orderSchema = new Schema({
  customerId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  createAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  statusId: {
    type: Number,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false,
  },
  item: {
    type: Object,
  },
  tableCode: {
    type: Number,
  },
  numOfItems: {
    type: Number,
  },
});
export const Order = model("Order", orderSchema, "Order");
