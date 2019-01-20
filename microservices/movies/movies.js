const LocalStorage = require('node-localstorage').LocalStorage
const movieData = new LocalStorage('./microservices/movies/data')
module.exports = function(app, port) {
  app.get('/', function(req, res) {
    console.log('get movies')
    res.send(movieData.getItem('movies.json'))
  })
  app.listen(port)
}
