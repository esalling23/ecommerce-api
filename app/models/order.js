const { model, Schema, Types } = require('mongoose')

const orderSchema = new Schema({
  products: [{
    type: Types.ObjectId,
    ref: 'Product'
  }],
  completed: {
    type: Boolean,
    default: false
  },
  owner: {
    type: Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

module.exports = model('Order', orderSchema)
