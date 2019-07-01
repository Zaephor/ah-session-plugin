// Duplicated and derived from https://github.com/actionhero/actionhero-angular-bootstrap-cors-csrf/blob/master/initializers/session.js
'use strict'
const { Initializer, api } = require('actionhero')
const path = require('path')
const crypto = require('crypto')
const util = require('util')

let config = ((api.config && api.config['ah-session-plugin'])) ? api.config['ah-session-plugin'] : require(path.join(__dirname, '..', 'config', 'ah-session-plugin.js'))[process.env.NODE_ENV || 'development']['ah-session-plugin'](api)

module.exports = class sessionInitializer extends Initializer {
  constructor () {
    super()
    this.name = 'ah-session-plugin'
    this.loadPriority = 1000
    this.startPriority = 1000
    this.stopPriority = 1000
  }

  async initialize () {
    api.log('[' + this.loadPriority + '] ' + this.name + ': Initializing')
    const redis = api.redis.clients.client

    api.session = {
      prefix: config.prefix + ':',
      duration: config.duration,
      load: async (connection) => { // Primarily used by the middleware to load the session to data.session
        const key = api.session.prefix + connection.fingerprint
        let data = await redis.get(key)
        if (!data) { return false } else {
          let dataObj = JSON.parse(data)
          if (
            (config.lockIp && dataObj.clientIp !== connection.remoteIP) ||
            (config.lockAgent && data.connection.type === 'web' && dataObj.userAgent !== connection.rawConnection.req.headers['user-agent'])
          ) {
            return false
          } else {
            return dataObj
          }
        }
      },
      create: async (connection, user) => { // Should be called by the user-auth system. User should be serializable. Ideally userID or name or email or something
        const key = api.session.prefix + connection.fingerprint
        const randomBuffer = await util.promisify(crypto.randomBytes)(64)
        const csrfToken = randomBuffer.toString('hex')

        const sessionData = {
          user: user,
          csrfToken: csrfToken,
          sesionCreatedAt: new Date().getTime()
        }
        if (config.lockIp) {
          sessionData.clientIp = connection.remoteIP
        }
        if (config.lockAgent && connection.type === 'web') {
          sessionData.userAgent = connection.rawConnection.req.headers['user-agent']
        }

        await redis.set(key, JSON.stringify(sessionData))
        await redis.expire(key, api.session.duration)
        return sessionData
      },
      destroy: async (connection) => { // Should be called by the user-auth system to clear a session/logout
        const key = api.session.prefix + connection.fingerprint
        await redis.del(key)
      },
      middleware: {
        'session:inject': {
          name: 'session:inject',
          global: (config.injectGlobal === true || config.injectGlobal === false) ? config.injectGlobal : false,
          priority: 1000,
          preProcessor: async (data) => {
            data.session = await api.session.load(data.connection)
            const key = api.session.prefix + data.connection.fingerprint
            await redis.expire(key, api.session.duration)
          }
        },
        'session:is-active': {
          name: 'session:is-active',
          global: false,
          priority: 1001,
          preProcessor: async (data) => {
            const sessionData = await api.session.load(data.connection)
            if (!sessionData) { throw new Error('Please log in to continue.') }
            if (config.lockIp && sessionData.clientIp !== data.connection.remoteIP) { throw new Error('Please log in to continue.') }
            if (data.connection.type === 'web') {
              if (config.lockAgent && sessionData.userAgent !== data.connection.rawConnection.req.headers['user-agent']) { throw new Error('Please log in to continue.') }
              if (!data.params.csrfToken || data.params.csrfToken !== sessionData.csrfToken) { throw new Error('CSRF error') }
            }

            data.session = sessionData
            const key = api.session.prefix + data.connection.fingerprint
            await redis.expire(key, api.session.duration)
          }
        }
      }
    }
    api.actions.addMiddleware(api.session.middleware['session:inject'])
    api.actions.addMiddleware(api.session.middleware['session:is-active'])
    api.params.globalSafeParams.push('csrfToken')
  }
}
