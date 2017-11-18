var express = require('express');
var app = express();
var fs = require('fs');
var router = express.Router();
var path = __dirname + '/views/';

const pg = require('pg');
const conString = 'postgres://postgres:1911994@147.175.183.10:5432/rl_data';
const remoteConString = 'postgres://zorkadorka:1KuKolman2@zorkadorka-postgres-instance.cp3nivdh9ikv.us-east-2.rds.amazonaws.com:5432/rl_data';

router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});

router.get("/",function(req,res){
  res.sendFile(path + "index.html");
});

router.get("/matrix",function(req,res){
  res.sendFile(path + "matrix.html");
});

router.get("/games",function(req,res){
  res.sendFile(path + "games.html");
});

router.get("/hand",function(req,res){
  res.sendFile(path + "offline-hand.html");
});

app.use("/",router);

app.get('/data/:id/:gameId', function (req, res) {
    var sampleId = req.params.id;
    var gameId = req.params.gameId;
 
    console.log('Reading ALL game data from db game = ' + sampleId + ' and id = ' + sampleId);
    var call = function(rows){      
      res.setHeader('Content-Type', 'application/json');
      console.log("Num of rows = " + rows.length);
      res.send(JSON.stringify(rows));
    }    
    connectAndSelectFromDb('Select old_state, action, new_state, reward, game_id, round, id, date_stamp, max_speed ' +
     'from "RL".experiences where game_id = \''+ gameId+'\' and id = ' + sampleId, call);        
});

app.get('/data-db/:id', function (req, res) {
    var sampleId = req.params.id;
    console.log('Reading ALL data from db for game =' + sampleId);
    readJSONFile('./data/new/data'+sampleId+'.json', function (err, json) {
        if(err) { 
          // console.log(err);
          throw err; 
        }         
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(json));
    });        
});

app.get('/game/:id', function (req, res) {
    var sampleId = req.params.id;
    console.log('Reading game data from db ' + sampleId);
    var call = function(rows){      
      res.setHeader('Content-Type', 'application/json');
      console.log("Num of rows = " + rows.length);
      res.send(JSON.stringify(rows));
    }    
    connectAndSelectFromDb('Select * from "RL".games where game_id = \''+ sampleId+'\' order by pid', call);
});

app.get('/hand/:id', function (req, res) {
    var sampleId = req.params.id;
    console.log('Reading offline hand data from db for game = ' + sampleId);
    var call = function(rows){      
      res.setHeader('Content-Type', 'application/json');
      console.log("Num of rows = " + rows.length);
      res.send(JSON.stringify(rows));
    }    
    connectAndSelectFromDb('Select action from "RL"."offlineExperiences" where game_id = \''+ sampleId+'\' order by pid limit 1000 ', 
    call);
});
app.get('/gameids/:id', function (req, res) {
  
    var sampleId = req.params.id;
    var call = function(rows){      
        res.setHeader('Content-Type', 'application/json');
        console.log("Num of rows = " + rows.length);
        res.send(JSON.stringify(rows));
    }
    if(sampleId.indexOf('0') > -1){
      console.log('Reading ONLINE game ids from db ');
      
      connectAndSelectFromDb('Select game_id from "RL".games group by game_id',
      call);
    }
    else{
      console.log('Reading OFFLINE game ids from db ');
      
      connectAndSelectFromDb('Select game_id from "RL"."offlineExperiences" group by game_id',
      call);
    }
});

app.get('/query/:query', function (req, res) {
  
    var query = req.params.query;
    var call = function(rows){      
        res.setHeader('Content-Type', 'application/json');
        console.log("Num of rows = " + rows.length);
        res.send(JSON.stringify(rows));
    }
    connectAndSelectFromDb(query,call);
    
});

app.use(express.static('public'));
app.use(express.static(__dirname+'/public'));

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)

})

function readJSONFile(filename, callback) {
  fs.readFile(filename, function (err, data) {
    if(err) {
      callback(err);
      return;
    }    
    var result;
    var parsed;
    try {
      parsed = JSON.parse(data);
    } catch(exception) {
      console.log("TYPE: " + typeof(data));      
      var dataStr= JSON.stringify(data);
      result = dataStr.replace('$', '');
      console.log("Rozdiel: " + (dataStr.length - result.length));
      parsed = JSON.parse(result);
    }
    callback(null, parsed);
  });
}

function connectAndSelectFromDb(query, callback){
  var conn = new pg.Client(remoteConString);
  conn.connect();
  console.log("query = " + query);
  var q = conn.query(query, function(err, res){
    if(err){
      console.log(err);
      return;
    }
    
    callback(res.rows);
    conn.end();
  });
  
}