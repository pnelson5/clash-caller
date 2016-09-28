var http, director, cool, bot, router, server, port, request;

http = require('http');
director = require('director');
bot = require('./bot.js');
request = require('request');

var in_array = require('in-array');
var async = require('async');
var moment = require('moment');

var redis = require('redis');
var client = redis.createClient(process.env.REDIS_URL);

client.on('connect', function()  {
  console.log('connected');
});

router = new director.http.Router({
  '/': {
    post: bot.respond,
    get: ping
  },
  '/cc': {
    get: get_code
  },
  '/log':{
    get: get_log
  }
});

server = http.createServer(function(req, res) {
  req.chunks = [];
  req.on('data', function(chunk) {
    req.chunks.push(chunk.toString());
  });

  router.dispatch(req, res, function(err) {
    res.writeHead(err.status, {
      "Content-Type": "text/plain"
    });
    res.end(err.message);
  });
});

port = Number(process.env.PORT || 5000);
server.listen(port);

function get_code(){
  var res_ = this.res;
  client.get('code', function(err, res, fld) {
    res_.end('Caller code: ' + res);
  });
}

function get_log(){
  var res_ = this.res;
  client.lrange('log', 0, -1, function(err, res, fld){
    message_ = [];
    if(res.length > 0){
      for(i in res){
        message_.push(moment(res[i].time).format("MMMM Do, h:mm:ss a") + ": " + res[i].message);
      }
      res_.end(message_.join("\n"));
    }else{
      res_.end("Nothing logged");
    }
  });
}


function ping() {
  this.res.writeHead(200);
  message = "#COMMMANDS:\n" +
    "/cc - Get clash caller link\n" +
    "/call # - Call a target\n" +
    "/delete call # - Delete call on target\n" +
    "/get call # - Get call on target\n" +
    "/get calls - Get all calls\n" +
    "/attacked # for # stars - Log attack done on target\n" +
    "/code - Get Clash Caller code\n" +
    "/me - Get your GroupMe ID\n" +
    "/help (-a) - Show this\n" +
    "/get log - Get log\n" +
    "/set cc (code) - Set new clash caller code manually\n" +
    "/start war (war size) (enemy name) - Start new clash caller and save\n" +
    "/clear log - Clear log";

  this.res.end(message);
}
