// Copyright (c) 2019 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// you can obtain one at http://mozilla.org/MPL/2.0/.

const fs = require('fs')
const Log = require('../lib/logging')
const path = require('path')
const { spawnSync } = require('child_process')
const util = require('../lib/util')

Log.progress('Performing initial checkout of unknown-core')

const unknownCoreDir = path.resolve(__dirname, '..', 'src', 'unknown')
const unknownCoreRef = util.getProjectVersion('unknown-core')

if (!fs.existsSync(path.join(unknownCoreDir, '.git'))) {
  Log.status(`Cloning unknown-core [${unknownCoreRef}] into ${unknownCoreDir}...`)
  fs.mkdirSync(unknownCoreDir)
  util.runGit(unknownCoreDir, ['clone', util.getNPMConfig(['projects', 'unknown-core', 'repository', 'url']), '.'])
  util.runGit(unknownCoreDir, ['checkout', unknownCoreRef])
}
const unknownCoreSha = util.runGit(unknownCoreDir, ['rev-parse', 'HEAD'])
Log.progress(`unknown-core repo at ${unknownCoreDir} is at commit ID ${unknownCoreSha}`)

let npmCommand = 'npm'
if (process.platform === 'win32') {
  npmCommand += '.cmd'
}

util.run(npmCommand, ['install'], { cwd: unknownCoreDir })

util.run(npmCommand, ['run', 'sync' ,'--', '--init'].concat(process.argv.slice(2)), {
  cwd: unknownCoreDir,
  env: process.env,
  stdio: 'inherit',
  shell: true,
  git_cwd: '.', })
