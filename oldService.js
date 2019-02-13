const stompit = require('stompit')
const log = require('json-log').log

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
      log.info('Could not connect to ' + address + ': ' + error.message)
    })

    connectFailOver.on('connecting', function(connector) {
      log.info(
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
            if (typeof cb === 'function') {
              cb(error, message, body)
            }
            channel.ack(message)
            this.actOnMessage(body)
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
  },

  setSendWorker: function(params) {
    console.log(params)
    const paramsArr = Array.isArray(params) ? params : [params]
    console.log(paramsArr)
    this.worker = paramsArr.filter(w => {
      res = typeof w.worker === 'function'
      !res && log.error('worker should be a function otherwise will be skipped')
      return res
    })
    return this
  },

  startService: function() {
    if (!this.worker && typeof this.worker.worker !== 'function') {
      log.error('startService Error: worker is not defined')
    }

    this.worker.forEach((w, i) => {
      const { worker, params, destination, event, loopTimer } = w
      const output = worker(params)
      if (loopTimer) {
        this.timers[`timer_${i}`] = setInterval(() => {
          const output = worker(params)
          console.log('worker out ', output)
          this.send(destination, event, JSON.stringify(output))
        }, loopTimer || 1000)
      } else {
        this.send(destination, event, JSON.stringify(output))
      }
    })

    this.activateClean(Object.keys(this.timers).length)
  },

  on: function(message, cb) {
    this.actOnMessagePool = this.actOnMessagePool ? this.actOnMessagePool : {}
    this.actOnMessagePool[message] = cb
    return this
  },
  actOnMessage: function(msg) {
    log.info('Received:', msg)
    try {
      const msgJson = JSON.parse(msg)
      if (this.actOnMessagePool.hasOwnProperty(msgJson.type)) {
        this.actOnMessagePool[msgJson.type](msg, this)
      }
    } catch (err) {
      log.error('actOnMessage Error: ', err)
    }
  },
  activateClean: function(cleanCounter) {
    process.stdin.resume()
    process.on('exit', this.exitHandler.bind(null, { cleanup: true }, this))
    process.on('SIGINT', this.exitHandler.bind(null, { exit: true }, this))
    process.on('SIGUSR1', this.exitHandler.bind(null, { exit: true }, this))
    process.on('SIGUSR2', this.exitHandler.bind(null, { exit: true }, this))
    process.on(
      'uncaughtException',
      this.exitHandler.bind(null, { exit: true }, this)
    )
  },

  exitHandler: function(options, module) {
    const timers = Object.keys(module.timers)
    timers.length && log.info('Service Terminated with memory cleanup', options)
    timers.forEach(key => clearInterval(module.timers[key]))
    process.exit()
  }
}

const SamanageMQ = function() {
  this.conf = {}
  this.timers = {}
  this.init = function(userConf) {
    this.verbose = userConf.verbose
    this.conf = this.mergeConfiguration(userConf)
    this.connectFailOver = this.createFailOver()
    this.channelManager = new stompit.ChannelPool(this.connectFailOver, {})
    return this
  }
  return this
}
SamanageMQ.prototype = samMQProto

module.exports = new SamanageMQ()
