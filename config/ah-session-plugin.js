'use strict'

exports['default'] = {
  'ah-session-plugin': (api) => {
    return {
      // Customize the session key prefixes. ':' will be appended automatically
      prefix: '__session',
      // Lifetime of user session before it goes stale. In seconds
      duration: 60 * 60 * 24 * 7, // 1 week
      // injectGlobal: true will set data.session to the contents of the current user's session, if no active session will return false
      injectGlobal: false,
      // lockIp: true will restrict the specific user session to the origin IP.
      //  If they roam connections, they should need to relogin
      lockIp: false,
      // lockAgent: true will scope the user session to the provided useragent string.
      //  Only works on web, still spoofable
      lockAgent: false
    }
  }
}

exports['test'] = {
  'ah-session-plugin': (api) => {
    return {
      // Customize the session key prefixes. ':' will be appended automatically
      prefix: '__session',
      // Lifetime of user session before it goes stale. In seconds
      duration: 60 * 60, // 1 hour
      // injectGlobal: true will set data.session to the contents of the current user's session, if no active session will return false
      injectGlobal: false,
      // lockIp: true will restrict the specific user session to the origin IP.
      //  If they roam connections, they should need to relogin
      lockIp: false,
      // lockAgent: true will scope the user session to the provided useragent string.
      //  Only works on web, still spoofable
      lockAgent: false
    }
  }
}
