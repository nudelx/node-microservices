const LocalStorage = require('node-localstorage').LocalStorage
const movieData = new LocalStorage('./microservices/movies/data')
const log = require('json-log').log

const express = require('express')
const app = express()
var bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true
  })
)
const port = process.env.ticketsPort || 5002
const updateTickets = (data, tickets) => {
  const movie = tickets[data.movie]
  if (!movie || !movie.length) return null
  const order =
    tickets[data.movie] &&
    tickets[data.movie].find(item => item.name === data.name)
  if (order) {
    order.num = parseInt(data.tickets) + parseInt(order.num)
  } else {
    tickets[data.movie].push({ name: data.name, num: parseInt(data.tickets) })
  }
  movieData.setItem('tickets.json', JSON.stringify(tickets))
  return true
}

const ticketsService = function() {
  app.get('/', function(req, res) {
    log.info('get tickets')
    res.send(movieData.getItem('tickets.json'))
  })

  app.post('/', function(req, res) {
    log.info('order tickets service')
    const postData = req.body
    const tickets = JSON.parse(movieData.getItem('tickets.json'))
    updateTickets(postData, tickets) ? res.send(200) : res.send(500)
  })

  app.listen(port)
}
ticketsService()
module.exports = ticketsService
