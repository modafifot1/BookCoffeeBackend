import { Schema, model, SchemaType } from "mongoose";
const tableSchema = Schema({
  tableCode: {
    type: Number,
    required: true,
  },
  status: {
    type: Number,
    required: true,
  },
  reservedUserId: {
    type: Schema.Types.ObjectId,
  },
  bookingTime: {
    type: Date,
  },
  waitingLstId: {
    type: [Schema.Types.ObjectId],
  },
});

export const Table = model("Table", tableSchema);
