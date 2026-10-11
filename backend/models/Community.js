const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    isProOnly: {
      type: Boolean,
      default: false,
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Community', communitySchema);