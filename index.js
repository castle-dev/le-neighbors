var get = require('get');
var q = require('q');

var MAX_STEPS = 20;
var STEPS_UP = 0;
var STEPS_DOWN = 0;
var STEPS_ACROSS = 0;

var Neighbors = function(authID, authToken) {

  var parseAddress = function(addressInput) {
    // Turns 'Street Address, Town, State, ZIP'
    // into an object the script understnds
    var streetAddressRe = /[0-9]+ [a-zA-z .]+/;
    var streetAddressExec = streetAddressRe.exec(addressInput);
    try {
      var streetAddress = streetAddressExec[0];
    }
    catch (err) {
      console.log('no valid street address');
    }
    
    var cityRe = /, [a-zA-Z- ]+,/;
    var cityExec = cityRe.exec(addressInput);
    try {
      var city = cityExec[0].slice(2,-1);
    }
    catch (err) {
      console.log('no valid city');
    }
    
    var stateRe = /, [A-Z]{2},*/;
    var stateExec = stateRe.exec(addressInput);
    try {
      var state = stateExec[0].slice(2,4);
    }
    catch (err) {
      console.log('no valid state');
    }

    var zipRe = /[0-9]{5}/;
    var zipExec = zipRe.exec(addressInput);
    try {
      var zip = zipExec[0];
    }
    catch (err) {
      console.log('no valid zip');
    }

    var addressObject = {
      address: streetAddress,
      city: city,
      state: state,
      zip: zip
    };

    return addressObject;
  };

  var makeUri = function(data) {
    var uri = 'https://api.smartystreets.com/street-address?street=' + escape(data.address) +
              '&city=' + escape(data.city) +
              '&state=' + data.state + 
              '&zipcode=' + data.zip +
              '&auth-id=' + authID +
              '&auth-token=' + authToken;
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
    var number = parseInt(getNumber(data.address));
    if (number < 1) {
      defer.reject();
    }
    else {
      var uri = makeUri(data);
      var dl = get(uri);
      dl.asString(function(err, ret) {
        if (err) defer.reject(err);
        // No results = no valid address
        if (ret === '[]\n') defer.reject();
        defer.resolve();
      });
    }
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
   
    var nextAddress;
    if (step_count === 1) {
     var initialAddress = replaceAddress(addressObject, initial);
     nextAddress = replaceAddress(initialAddress, increment);
    }
    else { 
      nextAddress = replaceAddress(addressObject, increment);
    }

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

  var walkAcross = function(addressObject) {
    STEPS_ACROSS = 0;
    var down = q.defer();
    var up = q.defer();
    walk(down, addressObject, 1, -2);
    down.promise
      .then(function(ret1) {
        STEPS_ACROSS = 0;
        walk(up, addressObject, -1, 2);
      })
      .catch(function(err) {
        down.reject(err);
        up.reject(err);
      });
    return [down.promise, up.promise];
  };

  this.findNeighbors = function(address, maxSteps) {
    var deferred = q.defer();

    // The optional parameter maxSteps can override
    // the default max steps if desired
    if (maxSteps !== undefined) {
      if (parseInt(maxSteps) === maxSteps) {
        MAX_STEPS = maxSteps;
      }
      else {
        deferred.reject('maxSteps is not an integer');
      }
    }

    var addressObject = parseAddress(address);
    var same = [walkDown(addressObject), walkUp(addressObject)];
    var across = walkAcross(addressObject);
    var both = same.concat(across);
    q
      .all(both)
      .spread(function(down, up, acrossDown, acrossUp) {
        var results = {
          up: up.address,
          down: down.address,
          acrossUp: acrossUp.address,
          acrossDown: acrossDown.address
        };
        deferred.resolve(results);
      });
    return deferred.promise;
  };
};

module.exports = Neighbors;
