var stompit = require('stompit')

var connectOptions = {
  host: 'localhost',
  port: 61613,
  connectHeaders: {
    host: 'localhost',
    // login: 'username',
    // passcode: 'password',
    'heart-beat': '5000,5000'
  }
}

stompit.connect(connectOptions, function(error, client) {
  if (error) {
    console.log('connect error ' + error.message)
    return
  }

  client.on('error', function(error) {
    console.error('This is error', error)
  })

  client.on('connecting', function(connector) {
    console.log('Could not connect to ' + connector)
  })

  const subscribeHeaders = {
    destination: '/alex/test',
    ack: 'client-individual'
  }

  client.subscribe(subscribeHeaders, function(error, message) {
    if (error) {
      console.log('subscribe error ' + error.message)
      return
    }

    message.readString('utf-8', function(error, body) {
      if (error) {
        console.log('read message error ' + error.message)
        return
      }
      console.log('received message: ' + body)
      client.ack(message)
    })
  })
})
