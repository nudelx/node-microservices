const reduceSeats = (movies, orders) =>
  Object.keys(movies).reduce((all, item) => {
    const movieId = movies[item].id
    const max = movies[item].max
    const total = orders[movieId].reduce((sum, order) => sum + order.num, 0)
    const free = max - total
    return { ...all, [movieId]: { max, free, canOrder: free > 0 } }
  }, {})

const updateTickets = (data, tickets, movieData) => {
  const movie = tickets[data.movie]
  if (!movie || !movie.length) return null
  const order =
    tickets[data.movie] &&
    tickets[data.movie].find(item => item.name === data.name)
  if (order) {
    console.log('Order found')
    order.num = parseInt(data.tickets)
    console.log('Order updated', order)
  } else {
    const newOrder = { name: data.name, num: parseInt(data.tickets) }
    tickets[data.movie].push(newOrder)
    console.log('Order created', newOrder)
  }
  movieData.setItem('tickets.json', JSON.stringify(tickets))
  return true
}

const order = (postData, movieData) => {
  const tickets = JSON.parse(getAllData(movieData))
  return updateTickets(postData, tickets, movieData)
}

const getAllData = movieData => movieData.getItem('tickets.json')

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

const apiInfo = {
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

module.exports = {
  apiInfo,
  calcTotalFinal,
  reduceSeats,
  updateTickets,
  getAllData,
  order
}
