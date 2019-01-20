module.exports = function() {
  const quotesDB = require('./dataBase.json')
  // console.log(quotesDB)
  const random = quotesDB => Math.floor(Math.random() * quotesDB.quotes.length)
  console.log(`Random ${random(quotesDB)}`)
  console.log(`get /  ${process.pid}`)
  return `quote =>  ${quotesDB.quotes[random(quotesDB)]}`
}
