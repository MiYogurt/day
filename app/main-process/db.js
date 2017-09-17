// import { ensureFileSync } from 'fs-extra'
// import { homedir } from 'os'
import { app } from 'electron'
import low from 'lowdb'

const dbPath = `${app.getPath('appData')}/${app.getName()}/db.json`
console.log(dbPath)
// ensureFileSync(dbPath)

const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync(dbPath)
const db = low(adapter)

db.defaults({
  projects: [],
  config: {
    packageType: 'npm'
  }
}).write()

export default db;
