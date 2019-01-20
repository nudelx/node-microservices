const axios = require('axios')

module.exports = function(api) {
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
    const resp = await Promise.all([
      axios.get('http://localhost:5001/').then(res => res.data),
      axios.get('http://localhost:5002/').then(res => res.data)
    ])
    const [movies, tickets] = resp
    const final = calcTotalFinal(movies, tickets)
    res.send({ final })
  })

  api.listen(5000, function() {
    console.log(`api is up`)
    console.log(`movies on port 5001 is up`)
    console.log(`tickets on port 5002 is up`)
  })
}
