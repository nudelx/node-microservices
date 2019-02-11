const axios = require('axios')
const express = require('express')
const api = express()
const log = require('json-log').log

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
        AVAILABLE: movies[key].max - names.total,
        SOLD: names.total,
        BY: names.by
      }
      return all
    }, {})
  }
  api.get('/', function(req, res) {
    log.info('api availability service')
    const resp = {
      'Available API': {
        movies: {
          port: 5001,
          get: '/'
        },
        tickets: {
          port: 5002,
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

  api.listen(5000, function() {
    log.info(`api is up`)
    log.info(`movies on port 5001 is up`)
    log.info(`tickets on port 5002 is up`)
  })
}

moviesAPI()
module.exports = moviesAPI
