const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    budget: { type: String },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);