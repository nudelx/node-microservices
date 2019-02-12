var stompit = require('stompit')

const SamMq = {
  config: {
    reconnectOptions: {
      maxReconnects: 100,
      maxReconnectDelay: 5000
    },
    'heart-beat': '5000,5000',
    checkServerIdentity: function() {
      return false
    },
    connectOptions: {}
  },
  channelManager: null,

  setConfiguration(key, value) {
    if (this.config.hasOwnProperty(key)) {
      this.config[key] = value
    } else {
      console.log(`Unknown key ${key}`)
    }
    return this
  },

  setChannelManager: function(connectOptions) {
    this.channelManager = new stompit.ChannelPool(
      new stompit.ConnectFailover(
        [connectOptions],
        this.config.reconnectOptions
      ).on('connecting', function(connector) {
        console.log(
          'Connecting to ' +
            connector.serverProperties.remoteAddress.transportPath
        )
      }),
      {}
    )
    return this
  },

  getSendHeaders({ destination, type }) {
    return {
      destination,
      'content-type': type || 'text/plain'
    }
  },

  connect: function(connectOptions) {
    if (!this.channelManager) this.setChannelManager(connectOptions)

    return new Promise((yes, no) => {
      this.channelManager.channel((error, channel) => {
        error ? no(error) : yes(channel)
      })
    })
  },

  init: function(connectOptions) {
    this.setConfiguration('connectOptions', connectOptions)
    console.log(this)
    return this
  },

  send: function(params) {
    return this.connect(this.config.connectOptions)
      .then(channel => this.sendMessage({ ...params, channel }))
      .catch(err => Promise.reject(err))
  },

  sendMessage({ channel, destination, type, msg, keepAlive }) {
    let res = null
    try {
      res = new Promise(yes => {
        channel.send(
          this.getSendHeaders({ destination, type }),
          msg,
          yes('message sent')
        )
      })
    } catch (err) {
      res = Promise.reject(err)
    }
    channel.on('ack', () => console.log('dde'))
    // debugger
    if (!keepAlive) {
      channel.close()
      this.channelManager.close()
    }

    return res
  },

  subscribe: ({ destination, ack, keepAlive }) => {
    const subscribeHeaders = {
      destination,
      ack: ack || 'client-individual'
    }

    return this.client
      .subscribe(subscribeHeaders, (error, message) => {
        return error ? Promise.reject(error) : Promise.resolve(message)
      })
      .then(message =>
        message.readString('utf-8', function(error, body) {
          this.client.ack(message)
          !keepAlive && this.client.disconnect()
          return error ? Promise.reject(error) : Promise.resolve(body)
        })
      )
  }
}

module.exports = SamMq
