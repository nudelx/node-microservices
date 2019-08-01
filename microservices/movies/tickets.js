const LocalStorage = require('node-localstorage').LocalStorage
const movieData = new LocalStorage('./microservices/movies/data')
const log = require('json-log').log

//curl -X POST http://localhost:5002/ -d '{"movie": "1", "name": "Alex", "tickets": "1"}' -H "Content-Type: application/json"

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
    console.log('Order found')
    order.num = parseInt(data.tickets) + parseInt(order.num)
    console.log('Order updated', order)
  } else {
    const newOrder = { name: data.name, num: parseInt(data.tickets) }
    tickets[data.movie].push(newOrder)
    console.log('Order created', newOrder)
  }
  movieData.setItem('tickets.json', JSON.stringify(tickets))
  return true
}

const order = postData => {
  const tickets = JSON.parse(getAllData())
  return updateTickets(postData, tickets)
}

const getAllData = () => movieData.getItem('tickets.json')

const ticketsService = function() {
  app.get('/', function(req, res) {
    log.info('get tickets')
    res.send(getAllData())
  })

  app.post('/', function(req, res) {
    log.info('order tickets service')
    const postData = req.body
    order(postData) ? res.sendStatus(200) : res.sendStatus(500)
  })

  app.listen(port, () => console.log(`Service listening at ${port}`))
}
ticketsService()
module.exports = ticketsService
