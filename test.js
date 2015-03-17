var get = require('get');
var q = require('q');

var us = {
  address: '760 Virginia Park Street',
  city: 'Detroit',
  state: 'MI',
  zip: '48202'
};

var omarion = {
  address: '759 Virginia Park Street',
  city: 'Detroit',
  state: 'MI',
  zip: '48202'
};

var fake = {
  address: '761 Virginia Park Street',
  city: 'Detroit',
  state: 'MI',
  zip: '48202'
};

var makeUri = function(data) {
  var uri = 'http://api.smartystreets.com/street-address?street=' + escape(data.address) +
            '&city=' + escape(data.city) +
            '&state=' + data.state + 
            '&zipcode=' + data.zip +
            '&auth-id=c5fe82ac-e88c-41ed-bce7-968bf368ba4a' + 
            '&auth-token=4PKfgfUFyiMPtIc2v43i';
  return uri;
};

var isValid = function(data) {
  var defer = q.defer();
  var uri = makeUri(data);
  var dl = get(uri);
  dl.asString(function(err, ret) {
    if (err) defer.reject(err);
    // No results = no valid address
    if (ret === '[]\n') defer.resolve(false);
    defer.resolve(true);
  });
  return defer.promise;
};

var getNumber = function(address) {
  var split = address.split(' ');
  return split[0];
};

var getNextAddress = function(address, increment) {
  var number = getNumber(address);
  var street = address.slice(number.length);
  
  var nextNumber = parseInt(number) + increment;
  nextAddress = nextNumber + street;

  return nextAddress;
};

var getNeighbors = function(data) {
  var sameUp = walk(data, 2, 1, 100);
  var sameDown = walk(data, 2, -1, 100);
  var acrossUp = walk(data, 1, 1, 100);
  var acrossDown = walk(data, 1, -1, 100);
  return [sameUp, sameDown, acrossUp, acrossDown];
};


