var get = require('get');
var q = require('q');

var MAX_STEPS = 100;
var STEPS_UP = 0;
var STEPS_DOWN = 0;
var STEPS_ACROSS = 0;

var AUTH_ID = 'c5fe82ac-e88c-41ed-bce7-968bf368ba4a';
var AUTH_TOKEN = '4PKfgfUFyiMPtIc2v43i';

var us = {
  address: '760 Virginia Park Street',
  city: 'Detroit',
  state: 'MI',
  zip: '48202'
};

var afc = {
  address: '750 Virginia Park Street',
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
            '&auth-id=' + AUTH_ID +
            '&auth-token=' + AUTH_TOKEN;
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

var walk = function(defer, addressObject, initial, increment) {
  if (Math.abs(initial) === 1) {
    STEPS_ACROSS++;
    var step_count = STEPS_ACROSS;
  }
  else if (increment > 0) {
    STEPS_UP++;
    var step_count = STEPS_UP;
  }
  else if (increment < 0) {
    STEPS_DOWN++;
    var step_count = STEPS_DOWN;
  }
  
  var nextAddress = replaceAddress(addressObject, increment);
  isValid(nextAddress)
    .then(
      function () {
        defer.resolve(nextAddress);
      },
      function () {
        if (step_count < MAX_STEPS) {
          walk(defer, nextAddress, initial, increment);
        }
        else {
          defer.reject();
        }
      }
    );
}

var walkDown = function(addressObject) {
  STEPS_DOWN = 0;
  var defer = q.defer();
  walk(defer, addressObject, 0, -2);
  defer.promise
    .then(function(ret) {
      defer.resolve(ret);
    })
    .catch(function(err) {
      defer.reject(err);
    });
  return defer.promise;
};

var walkUp = function(addressObject) {
  STEPS_UP = 0;
  var defer = q.defer();
  walk(defer, addressObject, 0, 2);
  defer.promise
    .then(function(ret) {
      defer.resolve(ret);
    })
    .catch(function(err) {
      defer.reject(err);
    });
  return defer.promise;
};

// This method is totally untested!
var walkAcross = function(addressObject) {
  STEPS_ACROSS = 0;
  var defer1 = q.defer();
  walk(defer1, addressObject, -1, -2);
  defer1.promise
    .then(function(ret1) {
      STEPS_ACROSS = 0;
      var defer2 = q.defer();
      walk(defer2, addressObject, 1, 2);
      defer2.promise
        .then(function(ret2) {
          console.log(ret1);
          console.log(ret2);
        });
    })
    .catch(function(err) {
      defer1.reject(err);
    });
  return defer1.promise;
});

var findNeighbors = function(addressObject) {
  q
    .all([
      walkDown(afc),
      walkUp(afc)
    ])
    .spread(function(down, up) {
      console.log('down neighbor is ' + down.address);
      console.log('up neighbor is ' + up.address);
    });
};
