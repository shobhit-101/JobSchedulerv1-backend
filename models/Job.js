// importing mongoose library
const mongoose = require('mongoose');
const jobSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: "pending"
  },
  scheduledAt: {
    type: Date  ,
    required: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});
module.exports = mongoose.model("Job", jobSchema);
