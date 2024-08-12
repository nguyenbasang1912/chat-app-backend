const { model, Schema } = require("mongoose");

const messageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  content: {
    type: String,
    required: true,
  },
  is_delete: {
    type: Boolean,
    default: false,
  },
  room_id: {
    type: Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  }
});

module.exports = model("Message", messageSchema);