const axios = require('axios')
const express = require('express')
const api = express()
const log = require('json-log').log
var bodyParser = require('body-parser')
api.use(bodyParser.json())
api.use(
  bodyParser.urlencoded({
    extended: true
  })
)
const port = 5000

const moviesAPI = function() {
  const calcTotalFinal = function(movies, tickets) {
    return Object.keys(movies).reduce(function(all, key) {
      const people = tickets[movies[key].id] || []
      const names = people.reduce(
        function(all, item) {
          return {
            by: [...all.by, item.name],
            total: all.total + item.num
          }
        },
        { by: [], total: 0 }
      )

      all[key] = {
        AVAILABLE:
          movies[key].max - names.total > 0
            ? movies[key].max - names.total
            : null,
        SOLD: names.total,
        BY: names.by
      }
      return all
    }, {})
  }
  api.get('/', function(req, res) {
    log.info('api  service')
    const resp = {
      'Available API': {
        movies: {
          port: 5001,
          get: '/'
        },
        tickets: {
          port: 5002,
          get: '/'
        },
        availability: {
          port: 5003,
          get: '/'
        }
      }
    }
    res.send(resp)
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
    log.info('api order service')
    const data = req.body
    const movieId = req.body.movie
    const resp = await axios
      .get('http://localhost:5003/')
      .catch(err => console.log(err))
    const canOrder = resp.data[movieId].canOrder
    log.info('result ', resp.data)
    log.info('is can order', canOrder)
    if (canOrder) {
      const post = await axios
        .post('http://localhost:5002/', data)
        .catch(err => console.log(err))
      log.info('post', post.data)
      res.send({ order: post.data })
    } else {
      res.send({ msg: 'no free seats' })
    }
  })

  api.listen(port, () => () => console.log(`Service listening at ${port}`))
}

moviesAPI()
module.exports = moviesAPI
