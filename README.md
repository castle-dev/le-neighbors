# Neighbors
The best way to find the nearest neighbors of any address in the US.

## Requirements

No external packages. Just remember to `npm install` before using.

## Usage

Here's a quick example:

```
var Neighbors = require('./index.js');
var neighbors = new Neighbors(authID, authToken);

var address = '750 Virginia Park Street, Detroit, MI 48202';
neighbors.findNeighbors(address)
  .then(function(ret) {
    console.log(ret);
  });
```

The console should log the following:

```
{ up: '760 Virginia Park Street',
  down: '740 Virginia Park Street',
  acrossUp: '759 Virginia Park Street',
  acrossDown: '743 Virginia Park Street' }
``` 

Note that the default maximum number of steps to take is 20. For the houses on the same side of the street in our example, that means we're looking at 710-790 on the even side, and 711-791 on the odd side. (Steps are in numerical increments of two, since we know if we're on the even or odd side of the street.) We do that to limit the number of API calls, which is how SmartyStreets charges.
