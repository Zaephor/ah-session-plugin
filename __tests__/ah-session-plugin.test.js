/* eslint-env node, mocha */
const fs = require('fs')
const path = require('path')
const {expect} = require('chai')
const ActionHero = require('actionhero')
const actionhero = new ActionHero.Process()

process.env.PROJECT_ROOT = path.join(require.resolve('actionhero'), '..')
let config = require(path.join(__dirname, '..', 'config', 'ah-session-plugin.js'))
let environment = (process.env.NODE_ENV && config[process.env.NODE_ENV]) ? process.env.NODE_ENV : 'default'
let api

describe('ah-session-plugin', () => {
  let configChanges = {
    'ah-session-plugin': config[environment]['ah-session-plugin'](ActionHero.api),
    plugins: {
      'ah-session-plugin': {path: path.join(__dirname, '..')}
    }
  }

  before(async () => {
    api = await actionhero.start({configChanges})
  })

  after(async () => {
    await actionhero.stop()
  })

  it('ActionHero server launches', () => {
    expect(api.running).to.equal(true)
  })

  // Generic module loaded check
  Array('session').forEach(function (attribute) {
    it(attribute + ' should be in api scope', async () => {
      expect(api[attribute]).to.exist
    })
  })

  it('test an unprotected endpoint')
  it('test a session-protected endpoint')
  it('initiate a user session')
  it('test an unprotected endpoint with the user session')
  it('test a session-protected endpoint with the user session')
  it('destroy the user session')
  it('test an unprotected endpoint with the user session fingerprint')
  it('test a session-protected endpoint with the user session fingerprint')

})
