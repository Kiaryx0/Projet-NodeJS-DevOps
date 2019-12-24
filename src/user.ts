import { LevelDB } from "./leveldb";
import bcrypt from 'bcrypt';

export class User {
  public username: string;
  public email: string;
  private password: string;
  private notHashedPassword: string;

  constructor(username: string, email: string, password: string, passwordHashed: boolean = true, notHashedPassword: string = "") {

    this.username = username;
    this.email = email;
    this.password = password;

    // Only used once when user is signing up to have clear text password for administrative purpose
    if (!passwordHashed) {
      this.notHashedPassword = password;
    } else {
      this.notHashedPassword = notHashedPassword;
    }

  }

  // Formatting db data for User class
  static fromDb(username: string, value: any): User {
    const [password, email, notHashedPassword] = value.split(":");
    return new User(username, email, password, true, notHashedPassword);
  }

  // Function to hash password
  public hashPassword(toHash: string) {
    // Hash password
    return new Promise((resolve, reject) => {
      const saltRounds = 5;
      bcrypt.genSalt(saltRounds)
        .then(function (salt: any) {
          bcrypt.hash(toHash, salt)
            .then(function (hash: any) {
              resolve(hash);
            })
            .catch((err: Error | null) => { console.log("Error setting password.", err); reject(err); })
        })
        .catch((err: Error | null) => { console.log("Error generating salt.", err); reject(err); })
    })
  }

  public setPassword(toSet: string): void {
    this.password = toSet;
  }

  public getPassword(): string {
    return this.password;
  }

  public getNotHashedPassword(): string {
    return this.notHashedPassword;
  }

  // Function to validate password
  public validatePassword(toValidate: string) {
    // return comparison with hashed password
    return new Promise((resolve, reject) => {
      bcrypt.compare(toValidate, this.getPassword())
        .then(function (res: any) {
          resolve(res);
        })
        .catch((err: Error | null) => {
          console.log("Error while validating password.", err);
          reject(err);
        })
    });
  }

}

export class UserHandler {
  private db: any;

  constructor(path: string) {
    this.db = LevelDB.open(path)
  }

  // Close db
  public close() {
    this.db.close();
  }

  // Display one specific user information
  public get(username: string) {
    return new Promise((resolve, reject) => {
      this.db.get(`user:${username}`, function (err: any, data: any) {
        if (err) {
          if (err.notFound) {
            resolve(undefined);
          } else {
            reject(err);
          }
        } else {
          resolve(User.fromDb(username, data));
        }
      })
    })
  }

  // Display all users information
  public getAll() {
    return new Promise((resolve, reject) => {
      let users: User[] = [];
      this.db.createReadStream()
        .on('data', function (data: any) {
          let dataKey: string[] = data.key.split(":");
          let dataValue: string[] = data.value.split(":");
          let newUser: User = new User(dataKey[1], dataValue[1], dataValue[0], true, dataValue[2]);
          users.push(newUser);
        })
        .on('error', function (err: Error | null) {
          reject(err);
        })
        .on('close', function () { })
        .on('end', function () {
          resolve(users);
        });
    });
  }

  // Save a user in db
  public save(user: User) {
    return new Promise((resolve, reject) => {
      this.db.put(`user:${user.username}`, `${user.getPassword()}:${user.email}:${user.getNotHashedPassword()}`, (err: Error | null) => {
        if (err) {
          console.log("Error while saving", err);
          reject(err);
        }
      });
    });
  }

  // Used to populate default database, not used in API
  public saveMany(users: User[], callback: (error: Error | null) => void) {
    var error = null;
    users.forEach((u: User) => {
      u.hashPassword(u.getPassword())
        .then((hash: string) => {
          u.setPassword(hash);
          this.db.put(`user:${u.username}`, `${u.getPassword()}:${u.email}:${u.getNotHashedPassword()}`, (err: Error | null) => {
            if(err) error = err;
          });
        })
    })
    callback(error);
  }

  // Delete user from db
  public delete(username: string) {
    return new Promise((resolve, reject) => {
      this.db.del(`user:${username}`, (error: Error | null) => {
        if (error) {
          console.log("Error while deleting", error);
          reject(error);
        }
      });
    });
  }

}