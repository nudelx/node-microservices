// var stompit = require('stompit')

var connectOptions = {
  host: 'localhost',
  port: 61613,
  connectHeaders: {
    // host: '/',
    // login: 'username',
    // passcode: 'password',
    'heart-beat': '5000,5000'
  }
}

// stompit.connect(connectOptions, function(error, client) {
//   if (error) {
//     console.log('connect error ' + error.message)
//     return
//   }

//   var sendHeaders = {
//     destination: '/alex/test',
//     'content-type': 'text/plain'
//   }

//   var frame = client.send(sendHeaders)
//   frame.write('hello')
//   frame.end()
//   client.disconnect()
// })

// const MQ = require('./microservices/lib/activeMq')
// MQ.init(connectOptions)
//   .send({
//     destination: '/alex/test',
//     msg: 'this is msg',
//     keepAlive: true
//   })
//   .then(s => console.log('out ' + s))
//   .catch(err => console.log(err))

/*
var stompit = require('stompit')

var connectionManager = new stompit.ConnectFailover([
  {
    host: 'localhost',
    port: 61613,
    resetDisconnect: false,
    connectHeaders: {
      'accept-version': '1.0',
      host: 'localhost',
      login: 'admin',
      passcode: 'password',
      'heart-beat': '1000,1000'
    }
  }
])

connectionManager.on('error', function(error) {
  var connectArgs = error.connectArgs
  var address = connectArgs.host + ':' + connectArgs.port
  console.log('Could not connect to ' + address + ': ' + error.message)
})

connectionManager.on('connecting', function(connector) {
  console.log(
    'Connecting to ' + connector.serverProperties.remoteAddress.transportPath
  )
})

var channelPool = stompit.ChannelPool(connectionManager)

channelPool.channel(function(error, channel) {
  if (error) {
    console.log('send-channel error: ' + error.message)
    return
  }

  var sendHeaders = {
    destination: '/alex/test'
  }

  channel.send(sendHeaders, 'hello', function(error) {
    if (error) {
      console.log('send error ' + error.message)
      return
    }

    console.log('message sent')
  })
})

channelPool.channel(function(error, channel) {
  if (error) {
    console.log('subscribe-channel error: ' + error.message)
    return
  }

  var subscribeHeaders = {
    destination: '/alex/test'
  }

  channel.subscribe(subscribeHeaders, function(error, message, subscription) {
    if (error) {
      console.log('subscribe error: ' + error.message)
      return
    }

    message.readString('utf8', function(error, body) {
      if (error) {
        console.log('read message error ' + error.message)
        return
      }

      console.log('received message: ' + body)

      subscription.unsubscribe()
    })
  })
})
*/
const mq = require('./oldService')
mq.init({
  host: 'localhost',
  post: 3333,
  connectHeaders: {
    login: 'bla',
    passcode: 'bla'
  }
})
  .subscribe('/alex/test', 'test_event', (e, m, b) => {})
  .send('/alex/test', null, JSON.stringify('blaaaaa '))

// console.log(mq)
