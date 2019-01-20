const LocalStorage = require('node-localstorage').LocalStorage
const movieData = new LocalStorage('./microservices/movies/data')
module.exports = function(app, port) {
  app.get('/', function(req, res) {
    console.log('get tickets')
    res.send(movieData.getItem('tickets.json'))
  })
  app.listen(port)
}
