import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cartId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

orderSchema.index({ userId: 1, createdAt: -1 })
orderSchema.index({ createdAt: -1 })

export default mongoose.model('Order', orderSchema)

