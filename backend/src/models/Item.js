import mongoose from 'mongoose'

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'not available'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

itemSchema.index({ status: 1, _id: 1 })

export default mongoose.model('Item', itemSchema)

