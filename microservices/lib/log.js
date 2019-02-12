const log = require('json-log').log
module.exports = log.child({
  hostname: require('os').hostname(),
  pid: process.pid
})
