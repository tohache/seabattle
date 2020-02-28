var express = require('express');
const SeaBattle = require('../modules/seabattle');
var router = express.Router();

const GAME_ID_COOKIE_NAME = 'game_id';

/* GET home page. */
router.get('/', function (req, res, next) {
   res.render('index');
});

router.get('/start_new_game', function (req, res, next) {
   const battle = new SeaBattle();
   battle.startNewGame().then((id) => {
      const result = {};
      result.id = id;
      res.cookie(GAME_ID_COOKIE_NAME, id);
      res.json(result);
   });
});

router.put('/make_fire', function (req, res, next) {
   const result = {};
   if ((!req.body.x || !req.body.y) && req.body.x !== 0 && req.body.y !== 0) {
      result.err_message = 'Request is not valid';
   } else if (!req.cookies[GAME_ID_COOKIE_NAME]) {
      result.err_message = 'Game id is not valid. Start new game first!';
   }
   if (result.err_message) {
      res.json(result);
      return;
   }

   const battle = new SeaBattle();
   battle.fire(req.cookies[GAME_ID_COOKIE_NAME], req.body.x, req.body.y).then((r) => {
      result.result = r.result;
      result.message = r.message;
   }).catch((e) => {
      result.err_message = e.message;
   }).finally(() => {
      res.json(result);
   });
});

module.exports = router;
