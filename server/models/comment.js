const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  body: {
    type: String,
    lowercase: true,
    trim: true
  },
  replies: [
    {
      body: {
        type: String,
        lowercase: true,
        trim: true
      },
      createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
      }
    }
  ],
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
}, { timestamp: true })

CommentSchema.index({
  body: 1,
});

CommentSchema.index({
  body: 'text',
});

const Comment = mongoose.model('Comment', CommentSchema)

module.exports = Comment 