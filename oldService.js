const stompit = require('stompit')
const samMQProto = {
  mergeObjects: function(base, merge) {
    return Object.keys(base).reduce((all, key) => {
      all[key] = merge[key] || base[key]
      return all
    }, {})
  },
  mergeConfiguration: function(userConf) {
    const defaults = this.getDefaults()
    const { basic } = defaults
    const mergedBasic = this.mergeObjects(basic, userConf)
    const mergedConnectHeaders = this.mergeObjects(
      basic.connectHeaders,
      userConf.connectHeaders
    )
    mergedConnectHeaders.host = mergedConnectHeaders.host || mergedBasic.host
    return {
      basic: {
        mergedBasic,
        connectHeaders: mergedConnectHeaders
      },
      reconnectOptions: defaults.reconnectOptions
    }
  },

  getDefaults: function() {
    return {
      reconnectOptions: {
        maxReconnects: 100,
        maxReconnectDelay: 5000
      },
      basic: {
        host: null,
        port: 61613,
        checkServerIdentity: function() {
          return false
        },
        connectHeaders: {
          host: null,
          login: null,
          passcode: null,
          'heart-beat': '5000,5000'
        }
      }
    }
  },

  createFailOver: function() {
    const connectFailOver = new stompit.ConnectFailover(
      [this.conf.basic],
      this.conf.reconnectOptions
    )

    connectFailOver.on('error', function(error) {
      var connectArgs = error.connectArgs
      var address = connectArgs.host + ':' + connectArgs.port
      console.log('Could not connect to ' + address + ': ' + error.message)
    })

    connectFailOver.on('connecting', function(connector) {
      console.log(
        'Connecting to ' +
          connector.serverProperties.remoteAddress.transportPath
      )
    })
    return connectFailOver
  },

  buildHeader: function(destination, event) {
    const headers = {
      ack: 'client-individual',
      'content-type': 'text/plain',
      destination
    }
    if (event) headers.selector = `messageType='${event}'`

    return headers
  },

  connect: function() {
    return new Promise((yes, no) => {
      this.channelManager.channel(function(error, channel) {
        error ? no(error) : yes(channel)
      })
    })
  },

  subscribe: function(destination, event, cb) {
    const headers = this.buildHeader(destination, event)
    this.connect()
      .then(channel => {
        channel.subscribe(headers, (error, message) => {
          message.readString('utf-8', (error, body) => {
            if (error) throw 'Failed to read a message: ' + error
            cb(error, message, body)
            channel.ack(message)
          })
        })
      })
      .catch(err => log.error('ERROR: Connection Error', { err }))
    return this
  },

  send: function(destination, event, payload) {
    this.connect().then(channel =>
      channel.send(
        {
          ack: 'client-individual',
          'content-type': 'text/plain',
          destination: destination,
          messageType: event
        },
        payload,
        function(error) {
          if (error) throw 'ERROR on SEND ' + error
        }
      )
    )
  }
}

const SamanageMQ = function() {
  this.conf = {}
  this.init = function(userConf) {
    this.conf = this.mergeConfiguration(userConf)
    this.connectFailOver = this.createFailOver()
    this.channelManager = new stompit.ChannelPool(this.connectFailOver, {})
    return this
  }
  return this
}
SamanageMQ.prototype = samMQProto

module.exports = new SamanageMQ()
