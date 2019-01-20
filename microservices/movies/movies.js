const LocalStorage = require('node-localstorage').LocalStorage
const movieData = new LocalStorage('./microservices/movies/data')

const express = require('express')
const app = express()
const port = process.env.moviesPort || 5001
const moviesService = function() {
  app.get('/', function(req, res) {
    console.log('get movies')
    res.send(movieData.getItem('movies.json'))
  })
  app.listen(port)
}

moviesService()

module.exports = moviesService
