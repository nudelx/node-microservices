const LocalStorage = require('node-localstorage').LocalStorage
const { reduceSeats } = require('./microHelper')
const movieData = new LocalStorage('./microservices/movies/data')
const log = require('json-log').log
const express = require('express')
const app = express()
const port = 5003

const availabilityService = function() {
  app.get('/', function(req, res) {
    log.info('get free seats')
    const movies = JSON.parse(movieData.getItem('movies.json'))
    const orders = JSON.parse(movieData.getItem('tickets.json'))
    const calc = reduceSeats(movies, orders)
    res.send(calc)
  })
  app.listen(port, () => console.log(`Service listening at ${port}`))
}

availabilityService()
