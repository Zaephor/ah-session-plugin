#!/usr/bin/env node
// Full credit to this method to @walbertoibarra/ah-oas-plugin
'use strict'

const fs = require('fs')
const path = require('path')

const projectDir = process.env.INIT_CWD || path.resolve('../../../', __dirname)

const projectApiConfigFile = path.join(projectDir, 'config/api.js')

const sourceConfigFile = path.join(process.cwd(), 'config/ah-session-plugin.js')
const targetConfigFile = path.join(projectDir, 'config/ah-session-plugin.js')

try {
  fs.lstatSync(projectApiConfigFile)
  // Only run if api config file exists (prevents install while in development)
  try {
    fs.lstatSync(targetConfigFile)
  } catch (ex) {
    // Only try to copy the files for fresh installs (prevents overriding config).
    console.log('Copying ' + sourceConfigFile + ' to ' + targetConfigFile)
    fs.createReadStream(sourceConfigFile).pipe(fs.createWriteStream(targetConfigFile))
  }
} catch (e) {
  console.log('postinstall script skipped')
}
