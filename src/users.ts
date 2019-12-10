import { LevelDB } from './leveldb';
import WriteStream from 'level-ws';

export class User {
    public username: string
    public email: string
    public password: string

    constructor(uname: string, mail: string, pswd: string) {
        this.username = uname;
        this.email = mail;
        this.password = pswd;
    }

    static fromDb(username: string, value: any): User {
        const [password, email] = value.split(":")
        return new User(username, email, password)
    }

    public setPassword(toSet: string): void {
        // Hash and set password
        let pswd = toSet.split('');
    }

    public getPassword(): string {
        return this.password
    }

    public validatePassword(toValidate: String): boolean {
        // return comparison with hashed password
        return true;
    }


}

export class UserHandler {
    public db: any

    constructor(dbPath: string) {
        this.db = LevelDB.open(dbPath);
    }

    public close() {
        this.db.close();
    }

    public save(user: User, callback: (err: Error | null) => void) {
        this.db.put(`user:${user.username}`, `${user.getPassword}:${user.email}`, (err: Error | null) => {
            callback(err)
        })
    }

    public saveMany(users: User[], callback: (error: Error | null) => void) {
        const stream = WriteStream(this.db)
        stream.on('error', callback)
        stream.on('close', callback)
        users.forEach((u: User) => {
            stream.write({ key: u.username, value: u.password })
        })
        stream.end()
    }

    public exists(user: User, callback: (result: boolean) => void) {
        let result = this.db.get(user.username);
        if (result !== null) {
            callback(true)
        } else {
            callback(false)
        }
    }

}

