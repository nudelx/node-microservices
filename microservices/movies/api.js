const axios = require('axios')
const express = require('express')
const { calcTotalFinal, apiInfo } = require('./microHelper')
const api = express()
const log = require('json-log').log
const port = 5000
var bodyParser = require('body-parser')
api.use(bodyParser.json())
api.use(
  bodyParser.urlencoded({
    extended: true
  })
)

const moviesAPI = function() {
  api.get('/', function(req, res) {
    log.info('api  service')
    res.send(apiInfo)
  })

  api.get('/show', async function(req, res) {
    log.info('api show service')
    const resp = await Promise.all([
      axios.get('http://localhost:5001/').then(res => res.data),
      axios.get('http://localhost:5002/').then(res => res.data)
    ])
    const [movies, tickets] = resp
    const final = calcTotalFinal(movies, tickets)
    res.send({ final })
  })

  api.get('/movies', async function(req, res) {
    log.info('api movies service')
    res.redirect(301, 'http://localhost:5001')
  })

  api.get('/avail', async function(req, res) {
    log.info('api availability service')
    res.redirect(301, 'http://localhost:5003')
  })

  api.post('/order', async function(req, res) {
    log.info('api order service', req, res)
    const order = req.body
    const movieId = order.movie
    const requestedTickets = order.tickets

    const avail = await axios
      .get('http://localhost:5003/')
      .catch(err => console.log(err))
    const canOrder = avail.data[movieId].canOrder
    const freeSeats = avail.data[movieId].free

    log.info('result ', avail.data)
    log.info('can order', canOrder)
    log.info('has amount seats', freeSeats)
    log.info('requested', requestedTickets)
    log.info('can get requested?', requestedTickets <= freeSeats)

    if (canOrder && requestedTickets <= freeSeats) {
      const post = await axios
        .post('http://localhost:5002/', order)
        .catch(err => console.log(err))
      log.info('post', post.data)
      res.send({ order: post.data })
    } else {
      res.send({ msg: 'no free seats' })
    }
  })

  api.listen(port, () => console.log(`Service listening at ${port}`))
}

moviesAPI()
module.exports = moviesAPI
