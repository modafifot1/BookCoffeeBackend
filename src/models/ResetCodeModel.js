import { Schema, model } from "mongoose";
const resetCodeSchema = Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  createAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  code: {
    type: String,
    required: true,
  },
  expired: {
    type: Boolean,
    required: true,
    default: false,
  },
});
export const ResetCode = model("ResetCode", resetCodeSchema, "ResetCode");
