const yoda = require('./microservices/yodaQuotes/yodaQuotes')
const moviesService = require('./microservices/movies/movies')
const ticketsService = require('./microservices/movies/tickets')
const api = require('./microservices/movies/api')
const log = require('./microservices/lib/log')
// moviesService(express(), 5001)
// ticketsService(express(), 5002)
// api(express(), 5000)
yoda(express(), 5003)
