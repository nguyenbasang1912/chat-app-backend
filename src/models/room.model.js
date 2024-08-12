const { model, Schema } = require("mongoose");

const roomSchema = new Schema({
  name: String,
  host: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  members: {
    type: [Schema.Types.ObjectId],
    ref: "User",
  },
  delete_messsage: {
    type: [
      {
        user_id: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        delete_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    default: [],
  },
  is_group: {
    type: Boolean,
    default: false,
  },
});

module.exports = model("Room", roomSchema);
