var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;
chai.use(chaiAsPromised);
import { User, UserHandler } from './user';
import { LevelDB } from './leveldb';
import { doesNotReject } from 'assert';

const dbPath: string = './db/users';
var dbUser: UserHandler;

describe('Users', function () {

    before(function () {
        LevelDB.clear(dbPath);
        dbUser = new UserHandler(dbPath);
    })

    after(function () {
        dbUser.close();
    })

    describe('Without database', function () {

        context('#get', function () {

            it('expect to NOT get one specific user', function () {
                return expect(dbUser.get("Louis")).to.eventually.be.undefined;
            });

            it('expect to NOT get any user', function () {
                return expect(dbUser.getAll()).to.eventually.be.empty;
            });
        });

        context('#save', function () {

            it('expect to save a user that doesn\'t exist', function () {
                let newUser: User = new User("Charlene", "charlene.bruno@edu.ece.fr", "chargez", false);
                return expect(newUser.hashPassword(newUser.getPassword()))
                    .to.eventually.be.fulfilled
                    .then((hash: string) => {
                        newUser.setPassword(hash);
                        dbUser.save(newUser)
                        .catch((err) => { expect(err).to.not.exist; })
                    })
                    .catch((err) => { expect(err).to.not.exist; });
            });

            it('check if user has been saved', function () {
                const expected = {
                    username: "Charlene",
                    email: "charlene.bruno@edu.ece.fr",
                    notHashedPassword: "chargez"
                };
                return expect(dbUser.get("Charlene")).to.eventually
                    .be.fulfilled
                    .and.to.have.keys("username", "email", "password", "notHashedPassword")
                    .and.to.include(expected);
            });
        })

        context('#delete', function () {

            it('expect to delete user created & check if user has been deleted', function () {
                dbUser.delete("Charlene")
                    .then(() => {
                        return expect(dbUser.get("Charlene")).to.eventually.be.undefined;
                    })
                    .catch((err) => { expect(err).to.not.exist })
            });
        })

    });

    describe('With database', function () {

        context('#setup', function () {

            it('should set up the database', function (done) {
                const users = [
                    new User('Louis', 'louis.deveze@edu.ece.fr', 'Framboise', false),
                    new User('Maxime', 'maxime.tran@edu.ece.fr', 'Litchi', false),
                ]
                dbUser.saveMany(users, (err: Error | null) => {
                    if (err) return done(err);
                    expect(err).to.not.exist;
                });
                done();
            });
            
        });

        context('#get', function () {

            // Ensure Database is set up
            it('Ensure Data exists in the Database', function (done) {
                const users = [
                    new User('Louis', 'louis.deveze@edu.ece.fr', 'Framboise', false),
                    new User('Maxime', 'maxime.tran@edu.ece.fr', 'Litchi', false),
                    new User('Charlene', 'charlene.Bruno@edu.ece.fr', 'chargez', false),
                ]
                dbUser.saveMany(users, (err: Error | null) => {
                    expect(err).to.be.null;
                    return done();
                });
            });

            it('expect to get one specific user', function (done) {
                const users = [
                    new User('Louis', 'louis.deveze@edu.ece.fr', 'Framboise', false),
                    new User('Maxime', 'maxime.tran@edu.ece.fr', 'Litchi', false),
                    new User('Charlene', 'charlene.bruno@edu.ece.fr', 'chargez', false),
                ]
                dbUser.saveMany(users, (err: Error | null) => {
                    const expected = {
                        username: "Louis",
                        email: "louis.deveze@edu.ece.fr",
                        notHashedPassword: "Framboise"
                    };
                    expect(dbUser.get("Louis")).to.eventually
                        .be.fulfilled
                        .and.to.have.keys("username", "email", "password", "notHashedPassword")
                        .and.to.include(expected);
                    
                    return done();
                });
                
            });

            it('expect to get any user', function (done) {
                const expected = [{
                    username: "Louis",
                    email: "louis.deveze@edu.ece.fr",
                    notHashedPassword: "Framboise"
                },
                {
                    username: "Maxime",
                    email: "maxime.tran@edu.ece.fr",
                    notHashedPassword: "Litchi"
                }];
                expect(dbUser.getAll()).to.eventually
                    .not.be.empty
                    .and.to.have.keys("username", "email", "password", "notHashedPassword")
                    .and.to.include(expected);
                return done();
            });
        });

        context('#save', function () {

            it('expect to save a user that doesn\'t exist', function () {
                let newUser: User = new User("Charlene", "charlene.bruno@edu.ece.fr", "chargez", false);
                return expect(newUser.hashPassword(newUser.getPassword()))
                    .to.eventually.be.fulfilled
                    .then((hash: string) => {
                        newUser.setPassword(hash);
                        dbUser.save(newUser)
                        .catch((err) => {
                            expect(err).to.not.exist;
                        });
                    })
                    .catch((err) => {
                        expect(err).to.not.exist;
                    });
            });

            it('check if user has been saved', function () {
                const expected = {
                    username: "Charlene",
                    email: "charlene.bruno@edu.ece.fr",
                    notHashedPassword: "chargez"
                };
                return expect(dbUser.get("Charlene")).to.eventually
                    .be.fulfilled
                    .and.to.have.keys("username", "email", "password", "notHashedPassword")
                    .and.to.include(expected)
            });

            it('expect to not save a user that exist', function () {
                let newUser: User = new User("Louis", "louis.deveze@edu.ece.fr", "chargez", false);
                return expect(newUser.hashPassword(newUser.getPassword()))
                .to.eventually.be.fulfilled
                .then((hash: string) => {
                    newUser.setPassword(hash);
                    dbUser.save(newUser)
                    .catch((err) => { expect(err).to.exist })
                })
                .catch((err) => { expect(err).to.not.exist })
            });
            
        })

        context('#delete', function () {

            it('expect to delete user created & check if user has been deleted', function () {
                dbUser.delete("Louis")
                    .then(() => {
                        return expect(dbUser.get("Louis")).to.eventually.be.undefined;
                    })
                    .catch((err) => { expect(err).to.not.exist })
            });
        })

    })

})