// Converts cents nums to string decimal
// 500 => '5.00'
const toDisplayPrice = n => {
  const decNum = (n / 100)
  const theNum = decNum.toFixed(2)
  return theNum
}

// Converts dollar-representing numbers like 5 to cents (500)
const toCentsPrice = n => {
  return n * 100
}

// calculates both cents & display total
const calculateTotalPrice = products => {
  const total = products.reduce((a, c) => a + toCentsPrice(parseFloat(c.price)), 0)
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
