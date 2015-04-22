var authID = '';
var authToken = '';

var Neighbors = require('./index.js');
var neighbors = new Neighbors(authID, authToken);

var address = '750 Virginia Park Street, Detroit, MI 48202';
neighbors.findNeighbors(address)
  .then(function(ret) {
    console.log(ret);
  });
