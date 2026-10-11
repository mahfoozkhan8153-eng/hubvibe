const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);