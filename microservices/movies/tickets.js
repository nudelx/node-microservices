const log = require('json-log').log
const LocalStorage = require('node-localstorage').LocalStorage
const movieData = new LocalStorage('./microservices/movies/data')
const { getAllData, order } = require('./microHelper')
const ticketsOnQueue = require('./mqTransport')

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

const ticketsService = function() {
  app.get('/', function(req, res) {
    log.info('get tickets')
    res.send(getAllData(movieData))
  })

  app.post('/', function(req, res) {
    log.info('order tickets service')
    const postData = req.body
    order(postData, movieData) ? res.sendStatus(200) : res.sendStatus(500)
  })

  app.listen(port, () => console.log(`Service listening at ${port}`))
}

ticketsService()

// ticketsOnQueue(msg => {
//   msg.tickets
//     ? console.log('ORDER', order(msg, movieData))
//     : console.log('GET', getAllData(movieData))
// })

module.exports = ticketsService
