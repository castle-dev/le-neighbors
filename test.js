var get = require('get');
var q = require('q');

var data = {
  address: '760 Virginia Park Street',
  city: 'Detroit',
  state: 'MI',
  zip: '48202'
};

var makeUri = function(data) {
  var uri = 'http://api.smartystreets.com/street-address?street=' + escape(data.address) +
            '&city=' + escape(data.city) +
            '&state=' + data.state + 
            '&zipcode=' + data.zip +
            '&auth-id=c5fe82ac-e88c-41ed-bce7-968bf368ba4a&auth-token=4PKfgfUFyiMPtIc2v43i';
  return uri;
};

var isValid = function(data) {
  var defer = q.defer();
  var uri = makeUri(data);
  var dl = get(uri);
  dl.asString(function(err, ret) {
    if (err) defer.reject(err);
    if (ret[0] === '[') defer.resolve(false);
    defer.resolve(true);
  });
  return defer.promise;
};
/*
var a = isValid(data);
a
  .then(function(ret) {
    console.log(ret);
  })
  .catch(function(err) {
    console.log(err);
  });
*/
var getNumber = function(address) {
  var split = address.split(' ');
  return split[0];
};

var walk = function(start, initial, posOrNeg, until) {
  var defer = q.defer();
  var startAddress = start.address;
  var startNumber = getNumber(startAddress);
  var startNumberLength = startNumber.length;

  var next = start;
  
  for (var i=initial; i<until; i += 2) {
    var nextNumber = parseInt(startNumber) + i*posOrNeg;
    var nextAddress = nextNumber + startAddress.slice(startNumberLength);
    next.address = nextAddress;
    var nextUri = makeUri(next);
    var a = isValid(next);
    a
      .then(function(ret) {
        if (ret) {
          defer.resolve(nexAddress);
        }
        else {
          defer.resolve(nextAddress + ' is invalid');
        }
      })
      .catch(function(ret) {
        defer.reject(ret);
      });
  }
  return defer.promise;
};

var getNeighbors = function(data) {
  var sameUp = walk(data, 2, 1, 100);
  var sameDown = walk(data, 2, -1, 100);
  var acrossUp = walk(data, 1, 1, 100);
  var acrossDown = walk(data, 1, -1, 100);
  return [sameUp, sameDown, acrossUp, acrossDown];
};
var a = walk(data, 1, -1, 4);
a
  .then(function(ret) { console.log(ret) })
  .catch(function(err) { console.log(err) });
