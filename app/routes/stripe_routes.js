require('dotenv').config()
const express = require('express')
const router = express.Router()

const Order = require('../models/order')

const requireToken = require('../../lib/require_token')

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const calculateTotalPrice = products => {
  return products.reduce((a, c) => {
    return a + (parseFloat(c.price).toFixed(2) * 100)
  }, 0)
}

router.post('/payment-intent/:orderId', requireToken, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId)
    const totalPrice = calculateTotalPrice(order.products)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice,
      currency: 'usd'
    })
    res.send(paymentIntent.client_secret)
  } catch(err) {
    next(err)
  }
})

module.exports = router
