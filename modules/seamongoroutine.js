const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

function SeaMongoRoutine () {
   const client = new MongoClient('mongodb://localhost:27017', { useNewUrlParser: true });
   const DB_NAME = 'Seabattle';
   const GAME_COLLECTION = 'GameRound';
   const LOG_COLLECTION = 'GameLog';

   function connect () {
      if (client.isConnected()) {
         console.log('Already connected to DB');
         return Promise.resolve('');
      }
      return client.connect()
         .catch((err) => {
            console.log('Can\'t connect to db ' + err.message);
            throw new Error(err.message);
         })
         .then(() => {
            console.log('connected to DB server');
         });
   }

   this.saveNewGame = function (game) {
      return connect().then(() => {
         return client.db(DB_NAME).collection(GAME_COLLECTION).insertOne(game);
      }).then((result) => {
         console.log('inserted game id=' + result.insertedId);
         return result.insertedId;
      })
         .catch((err) => {
            console.log('Error on saving new game to DB');
            throw new Error(err.message);
         });
   };

   this.loadGameState = function (id) {
      return connect().then(() => {
         return client.db(DB_NAME).collection(GAME_COLLECTION).findOne({ _id: ObjectId(id) }).then((game) => {
            if (!game) {
               const msg = 'Can\'t find game by id ' + id;
               console.log(msg);
               throw new Error(msg);
            }
            return game;
         });
      });
   };

   this.saveFireLog = function (id, log) {
      log.gameId = ObjectId(id);
      return connect().then(() => {
         return client.db(DB_NAME).collection(LOG_COLLECTION).insertOne(log);
      })
         .catch((err) => {
            console.log('Error on saving log to DB');
            console.log(err.message);
            throw new Error(err.message);
         });
   };

   this.updateGameState = function (game) {
      return connect().then(() => {
         return client.db(DB_NAME).collection(GAME_COLLECTION).replaceOne({ _id: game._id }, game);
      })
         .catch((err) => {
            console.log('Error on saving game state to DB' + game);
            console.log(err);
            throw new Error(err.message);
         });
   };
}

module.exports = new SeaMongoRoutine();
