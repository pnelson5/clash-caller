var redis = require('redis');
var client = redis.createClient(process.env.REDIS_URL);

client.on('connect', function()  {
  console.log('connected');
});
