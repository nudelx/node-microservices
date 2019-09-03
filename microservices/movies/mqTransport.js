module.exports = function(cb) {
  const stompit = require('stompit')
  var connectOptions = {
    host: 'localhost',
    port: 61613,
    connectHeaders: {
      host: '/',
      login: 'username',
      passcode: 'password',
      'heart-beat': '5000,5000'
    }
  }

  stompit.connect(connectOptions, function(error, client) {
    if (error) {
      console.log('connect error ' + error.message)
      return
    }

    const subscribeHeaders = {
      destination: 'tickets_service',
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

        let parsed = {}
        try {
          parsed = JSON.parse(body) || {}
        } catch (err) {}

        cb(parsed)
        client.ack(message)
      })
    })
    console.log('MQ subscribed')
  })
}
