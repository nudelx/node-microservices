const express = require('express')
const app = express()
const yoda = require('./microservices/yodaQuotes/yeadQuotes')
const moviesService = require('./microservices/movies/movies')
const ticketsService = require('./microservices/movies/tickets')
const api = require('./microservices/movies/api')
const axios = require('axios')

// app.listen(5000)

moviesService(express(), 5001)
ticketsService(express(), 5002)
api(express(), 5000)
