import encoding from 'encoding-down'
import leveldown from 'leveldown'
import levelup from 'levelup'
import fs from 'fs'
import del from 'del'

// Creating LevelDB DataAcess Object
export class LevelDB {

  static open(path: string) {
    console.log(path);
    if(!fs.existsSync(path)){
      fs.mkdir('./path/to/dir', {recursive: true}, err => {});
    } 
    const encoded = encoding(leveldown(path), { valueEncoding: 'json', createIfMissing: true })
    return levelup(encoded)
  }

  static clear(path: string) {
    if (fs.existsSync(path)) {
      del.sync(path, { force: true })
    }
  }
}