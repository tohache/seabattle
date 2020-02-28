function SeaBattle () {
   const db = require('./seamongoroutine');
   const battleOld = require('./sea_old');

   this.startNewGame = function () {
      console.log('startNewGame');
      const square = battleOld().getSquare();
      const objectToSave = { square: square };
      return db.saveNewGame(objectToSave);
   };

   this.loadGame = function (id) {
      console.log('loadGame id=' + id);
      const result = {};
      return db.loadGameState(id).then((dbGame) => {
         result.square = battleOld(dbGame.square).getClientSquareView();
      }).then(() => {
         return db.loadFireLog(id).then((logs) => {
            result.logs = logs;
            return result;
         });
      });
   };

   this.fire = function (id, x, y) {
      console.log('fire id=' + id + '(' + x + ', ' + y + ')');
      const result = {};
      return db.loadGameState(id).then((dbGame) => {
         const battle = battleOld(dbGame.square);
         try {
            result.result = battle.fire(x, y);
         } catch (e) {
            result.message = e.message;
         }
         dbGame.square = battle.getSquare();
         return dbGame;
      }).then((dbGame) => {
         return db.updateGameState(dbGame);
      }).then(() => {
         const doc = { x: x, y: y };
         if (result.message) {
            doc.message = result.message;
         }
         if (result.result || result.result === 0) {
            doc.result = result.result;
         }
         return db.saveFireLog(id, doc);
      }).then(() => {
         return result;
      });
   };
}
module.exports = SeaBattle;
