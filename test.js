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

var newAddressObject = function(original, newAddress) {
  var newAddressObject = {
    address: newAddress,
    city: original.city,
    state: original.state,
    zip: original.zip
  };

  return newAddressObject;
};

var getNumber = function(address) {
  var split = address.split(' ');
  return split[0];
};

var replaceAddress = function(addressObject, increment) {
  var address = addressObject.address;
  var number = getNumber(address);
  var street = address.slice(number.length);
  
  var nextNumber = parseInt(number) + increment;
  var nextAddress = nextNumber + street;

  return newAddressObject(addressObject, nextAddress);
};

var isValid = function(data) {
  var defer = q.defer();
  var uri = makeUri(data);
  var dl = get(uri);
  dl.asString(function(err, ret) {
    if (err) defer.reject(err);
    // No results = no valid address
    if (ret === '[]\n') defer.reject();
    defer.resolve();
  });
  return defer.promise;
};

var count = 0;
findNearestNeighbor = function (addressObject, promise) {
  count++;
  console.log(count);
  var nextAddress = replaceAddress(addressObject, -2);
  isValid(nextAddress).then(function () {
    // this is a neighbor
    promise.resolve(nextAddress);
  }, function () {
    if (count < 7) {
      findNearestNeighbor(nextAddress, promise);
    }
    else {
      promise.reject(false);
    }
  });
}

var p = q.defer();
findNearestNeighbor(us, p);
p.promise
  .then(function(ret) { console.log(ret); })
  .catch(function(ret) { console.log(ret); });
