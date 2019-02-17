const express = require('express')
const log = require('../lib/log')
const app = express()
const port = process.env.yodaPort || 3000

const yodaQuotes = function() {
  app.get('/', function(req, resp) {
    const quotesDB = require('./dataBase.json')
    const random = quotesDB =>
      Math.floor(Math.random() * quotesDB.quotes.length)
    log.info(`Random ${random(quotesDB)}`)
    log.info(`yoda get /  ${process.pid}`)
    resp.send(`quote =>  ${quotesDB.quotes[random(quotesDB)]}`)
  })

  app.listen(port)
}

yodaQuotes()

module.exports = yodaQuotes
