// Converts cents nums to string decimal
// 500 => '5.00'
const toDisplayPrice = n => (n / 100).toFixed(2)

// Converts dollar-representing numbers like 5 to cents (500)
const toCentsPrice = n => n * 100

// Calculate total cents
const calculateTotalCents = cartProducts => {
  const total = cartProducts.reduce((a, c) => {
    return a + Math.round((parseFloat(c.productRef.price) * c.count * 100))
  }, 0)
  return total
}

module.exports = {
  toDisplayPrice,
  toCentsPrice,
  calculateTotalCents
}
