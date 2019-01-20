module.exports = function(app, port) {
  app.get('/', function() {
    const quotesDB = require('./dataBase.json')
    const random = quotesDB =>
      Math.floor(Math.random() * quotesDB.quotes.length)
    console.log(`Random ${random(quotesDB)}`)
    console.log(`yoda get /  ${process.pid}`)
    return `quote =>  ${quotesDB.quotes[random(quotesDB)]}`
  })

  app.listen(port)
}
