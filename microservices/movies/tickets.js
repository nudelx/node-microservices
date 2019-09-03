const log = require('json-log').log
const LocalStorage = require('node-localstorage').LocalStorage
const movieData = new LocalStorage('./microservices/movies/data')
const { getAllData, order } = require('./microHelper')

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

const ticketsOnQueue = function() {
  const stompit = require('stompit')
  var connectOptions = {
    host: 'localhost',
    port: 61613,
    connectHeaders: {
      host: '/',
      login: 'username',
      passcode: 'password',
      'heart-beat': '5000,5000'
    }
  }

  stompit.connect(connectOptions, function(error, client) {
    if (error) {
      console.log('connect error ' + error.message)
      return
    }

    var sendHeaders = {
      destination: 'demo',
      'content-type': 'text/plain'
    }

    // var frame = client.send(sendHeaders)
    // frame.write('hello')
    // frame.end()

    var subscribeHeaders = {
      destination: 'demo',
      ack: 'client-individual'
    }

    client.subscribe(subscribeHeaders, function(error, message) {
      if (error) {
        console.log('subscribe error ' + error.message)
        return
      }

      message.readString('utf-8', function(error, body) {
        if (error) {
          console.log('read message error ' + error.message)
          return
        }

        let parsed = {}
        try {
          parsed = JSON.parse(body) || {}
        } catch (err) {}
        parsed.tickets
          ? console.log('ORDER', order(parsed))
          : console.log('GET', getAllData())
        client.ack(message)
      })
    })
  })
}

ticketsService()
// ticketsOnQueue()

module.exports = ticketsService
