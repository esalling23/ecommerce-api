// Converts cents nums to string decimal
// 500 => '5.00'
const toDisplayPrice = n => (n / 100).toFixed(2)

// Converts dollar-representing numbers like 5 to cents (500)
const toCentsPrice = n => n * 100

// calculates both cents & display total
const calculateTotalPrice = cartProducts => {
  const total = cartProducts.reduce((a, c) => {
    return a + Math.round((parseFloat(c.productRef.price) * c.count * 100))
  }, 0)
  console.log(total)
  return {
    centsTotal: total,
    displayTotal: (total / 100).toFixed(2)
  }
}

module.exports = {
  toDisplayPrice,
  toCentsPrice,
  calculateTotalPrice
}
