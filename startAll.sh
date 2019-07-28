pm2 start microservices/movies/availability.js -i 2
pm2 start microservices/movies/movies.js -i 2
pm2 start microservices/movies/tickets.js -i 2
pm2 start microservices/movies/api.js -i 2