const stompit = require('stompit')

stompit.connect({ host: 'localhost', port: 61613 }, (err, client) => {
  const frame = client.send({ destination: '/alex/test' })

  frame.write(JSON.stringify({ type: 'alex::test1' }))
  frame.end()

  const frame2 = client.send({ destination: '/alex/test' })

  frame2.write(JSON.stringify({ type: 'alex::another' }))
  frame2.end()

  client.disconnect()
})
