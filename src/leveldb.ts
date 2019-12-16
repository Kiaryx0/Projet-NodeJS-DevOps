import encoding from 'encoding-down'
import leveldown from 'leveldown'
import levelup from 'levelup'
import fs from 'fs'
import del from 'del'

// Creating LevelDB DataAcess Object
export class LevelDB {

  static open(path: string) {
    const encoded = encoding(leveldown(path), { valueEncoding: 'json' })
    return levelup(encoded)
  }

  static clear(path: string) {
    if (fs.existsSync(path)) {
      del.sync(path, { force: true })
    }
  }
}