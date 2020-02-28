function SeaBattle () {
   const db = require('./seamongoroutine');
   const battleOld = require('./sea_old');

   this.startNewGame = function () {
      console.log('startNewGame');
      const square = battleOld().getSquare();
      const objectToSave = { square: square };
      return db.saveNewGame(objectToSave);
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
         return db.saveFireLog(id, doc);
      }).then(() => {
         return result;
      });
   };
}
module.exports = SeaBattle;
