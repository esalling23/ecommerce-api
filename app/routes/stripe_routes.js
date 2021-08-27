require('dotenv').config()
const express = require('express')
const router = express.Router()

const Order = require('../models/order')

const requireToken = require('../../lib/require_token')

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const calculateTotalPrice = products => {
  return products.reduce((a, c) => {
    a.displayTotal += parseFloat(parseFloat(c.price).toFixed(2))
    a.centsTotal += a.displayTotal * 100
    return a
  }, { centsTotal: 0, displayTotal: 0 })
}

router.post('/payment-intent/:orderId', requireToken, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId)
    const { centsTotal, displayTotal } = calculateTotalPrice(order.products)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: centsTotal,
      currency: 'usd'
    })
    res.send({
      clientSecret: paymentIntent.client_secret,
      totalPrice: displayTotal
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
