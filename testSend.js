const stompit = require('stompit')

stompit.connect({ host: 'localhost', port: 61613 }, (err, client) => {
  const frame = client.send({ destination: '/alex/test' })

  frame.write('alex::test1')

  frame.end()

  client.disconnect()
})
