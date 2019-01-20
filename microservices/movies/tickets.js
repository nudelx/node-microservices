const LocalStorage = require('node-localstorage').LocalStorage
const movieData = new LocalStorage('./microservices/movies/data')

const express = require('express')
const app = express()
const port = process.env.ticketsPort || 5002
const ticketsService = function() {
  app.get('/', function(req, res) {
    console.log('get tickets')
    res.send(movieData.getItem('tickets.json'))
  })
  app.listen(port)
}
ticketsService()
module.exports = ticketsService
