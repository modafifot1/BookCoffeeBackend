import { Schema, model } from "mongoose";
const replySchema = Schema({
  userName: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});
const feedbackSchema = Schema({
  foodId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  numOfStars: {
    type: Number,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
  feedBackType: {
    type: Number,
  },
  reply: [
    {
      type: replySchema,
    },
  ],
});
export const Feedback = model("Feedback", feedbackSchema, "Feedback");
export const Reply = model("Reply", replySchema);
