const processResponse = function (response, successCallback) {
   if (response.err_message) {
      alert(response.err_message);
   } else {
      try {
         successCallback(response);
      } catch (e) {
         console.log(e.message);
         alert(e.message || 'Some error appears');
      }
   }
};

const createRequest = function (metod, url) {
   const req = new XMLHttpRequest();
   req.open(metod, url, true);
   req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
   req.responseType = 'json';
   req.withCredentials = true;
   return req;
};

const startNewGame = function () {
   const req = createRequest('GET', 'start_new_game');
   req.onload = function () {
      processResponse(req.response, (response) => {
         if (response.id) {
            clearSquare();
            document.getElementById('sq_div').style.display = 'block';
            clearLog();
            appendLog('New game started');
         } else {
            throw new Error('Some error appears on starting game');
         }
      });
   };
   req.send(null);
};

const makeFire = function (e) {
   e = e || window.event;
   e.stopPropagation();
   const td = e.target || e.srcElement;
   if (td === null) {
      return;
   }
   const y = parseInt(td.parentNode.id.replace('sq_y_', ''));
   const tdId = parseInt(td.id.replace('sq_', ''));
   const x = tdId - y * 10;

   const req = createRequest('PUT', 'make_fire');
   req.onload = function () {
      processResponse(req.response, (response) => {
         appendLog('Fire (' + x + ', ' + y + ') Result: ' + (response.message ? response.message : response.result));
         setCellState(td, response.result);
      });
   };

   const json = {};
   json.x = x;
   json.y = y;
   req.send(JSON.stringify(json));
};

const refreshLastState = function () {
   if (!document.cookie.includes('game_id=')) {
      return;
   }
   const req = createRequest('GET', 'get_last_game');
   req.onload = function () {
      processResponse(req.response, (response) => {
         if (response.square) {
            populateSquare(response.square);
            document.getElementById('sq_div').style.display = 'block';
            if (response.logs) {
               populateLog(response.logs);
            }
         } else {
            throw new Error('Some error appears on starting game');
         }
      });
   };
   req.send(null);
};

const populateSquare = function (square) {
   for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
         setCellState(document.getElementById('sq_' + (y * 10 + x)), square[x][y]);
      }
   }
};

const populateLog = function (logs) {
   clearLog();
   for (let i = 0; i < logs.length; i++) {
      appendLog('Fire (' + logs[i].x + ', ' + logs[i].y + ') Result: ' + (logs[i].message ? logs[i].message : logs[i].result));
   }
};

const clearSquare = function () {
   for (let x = 0; x < 100; x++) {
      document.getElementById('sq_' + x).innerHTML = '';
   }
};

const setCellState = function (td, result) {
   if (result === -1) {
      td.innerHTML = '.';
   } else if (result === 0) {
      td.innerHTML = '/';
   } else if (result === 1) {
      td.innerHTML = 'X';
   }
};

const appendLog = function (message) {
   const logDiv = document.getElementById('log_div');
   if (logDiv === null) {
      return;
   }
   if (logDiv.firstChild !== null) {
      const br = document.createElement('br');
      logDiv.insertBefore(br, logDiv.firstChild);
   }
   const logNode = document.createTextNode(message);
   logDiv.insertBefore(logNode, logDiv.firstChild);
};

const clearLog = function () {
   const logDiv = document.getElementById('log_div');
   if (logDiv === null) {
      return;
   }
   logDiv.innerHTML = '';
};
