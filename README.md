currency-market
===============

[![Build Status](https://travis-ci.org/pghalliday/currency-market.png)](https://travis-ci.org/pghalliday/currency-market)
[![Dependency Status](https://gemnasium.com/pghalliday/currency-market.png)](https://gemnasium.com/pghalliday/currency-market)

A synchronous implementation of a limit order based currency market

## Installation

```
npm install currency-market
```

## Usage

The `currency-market` package is intended to be used by a system of components that need to be synchronized. Those components are

- A number of front ends that generate operations and allow the state of the market to be queried
- An operation hub that accepts the operations and ensures they are submitted to order matching engines in a reproducible order
- A number of identical order matching engines that process the operations and calculate the new state of the market for each one
- A delta hub that receives the market state deltas and distributes them to the front ends

On intialization

- Engines will be constructed (perhaps from a previous engine state) and when requested will send the state to the delta hub

```Javascript
var Engine = require('currency-market').Engine;
var Amount = require('currency-market').Amount;

var COMMISSION_RATE = new Amount('0.001');
var COMMISSION_REFERENCE = '0.1%';

var engine = new Engine({
  commission: {
    account: 'commission'
    calculate: function(params) {
      return {
        amount: params.amount.multiply(COMMISSION_RATE),
        reference: COMMISSION_REFERENCE
      };
    }
  },
  json: previousEngineState  
});

...

sendStateToDeltaHub(JSON.stringify(engine));
```

- The delta hub will request the state from an engine and forward that to the front ends when they start up

```Javascript
var State = require('currency-market').State;

getStateFromEngine(function(receivedEngineState){
  var state = new State({
    commission: {
      account: 'commission'
    },
    json: receivedEngineState  
  });
});

...

sendStateToFrontEnd(JSON.stringify(state));
```

- Front ends will request the state and then construct a state from the JSON state they receive from the delta hub

```Javascript
var State = require('currency-market').State;

getStateFromDeltaHub(function(receivedState){
  var state = new State({
    commission: {
      account: 'commission'
    },
    json: receivedState
  });
});
```

Then the life cycle of an operation is as follows

- A front end constructs an operation and sends it to an operation hub

```Javascript
var Operation = require('currency-market').Operation;
var Amount = require('currency-market').Amount;

var operation = new Operation({
  reference: '550e8400-e29b-41d4-a716-446655440000',
  account: 'Peter',
  deposit: {
    currency: 'EUR',
    amount: new Amount '500'
  }
});

sendToOperationHub(JSON.stringify(operation));
```

- The operation hub receives the operation, accepts it with a seqence number and timestamp and forwards it to the engine instances

```Javascript
var Operation = require('currency-market').Operation;

var operation = new Operation({
  json: receivedJSON  
});

operation.accept({
  sequence: 654852,
  timestamp: 1371737390976
});

sendToEngines(JSON.stringify(operation));
```

- The engines receive the operation, process it and send market state deltas to the delta hub

```Javascript
var Operation = require('currency-market').Operation;

var operation = new Operation({
  json: receivedJSON  
});

delta = engine.apply(operation);

sendToDeltaHub(JSON.stringify(delta));
```

- The delta hub receives the deltas, processes the first of each one it receives to update its own state and sends that delta on to the front ends

```Javascript
var Delta = require('currency-market').Delta;

var delta = new Delta({
  json: receivedJSON  
});

state.apply(delta);

sendToFrontEnds(JSON.stringify(delta));
```

- The front ends receive the deltas and apply them to their own state so that they can respond to queries with the new information

```Javascript
var Delta = require('currency-market').Delta;

var delta = new Delta({
  json: receivedJSON  
});

state.apply(delta);

var funds = state.getAccount('Peter').getBalance('EUR').funds
```

## API

All functions complete synchronously and throw errors if they fail.

### `Amount`

`Amount` handles large numerical arithmetic accurately (unlike the built in Javascript number implementation). It is used for all amount and price values and is provided as a utility for applications to apply the same arimthmetic functionality in their own contexts.

`Amount` instances are immutable.

Divisions are carried out to an arbitrary precision of 25 decimal points.

``` Javascript
var Amount = require('currency-market').Amount;

// Always initialise from a string representation of a number
var amount1000 = new Amount('1000');
var amount200 = new Amount('200');

// multiply 2 amounts
var amount200000 = amount1000.multiply(amount200);

// add 2 amounts
var amount1200 = amount1000.add(amount200);

// subtract 2 amounts
var amount800 = amount1000.subtract(amount200);

// divide 2 amounts
var amountPoint2 = amount200.divide(amount1000);

// Return the string representation of an amount
var str1000 = amount1000.toString();

// Compare 2 values
amount1000.compareTo(amount200) > 0;
amount200.compareTo(amount1000) < 0;
amount200.compareTo(amount200) == 0;

// 2 Identity constants are defined
var zero = Amount.ZERO;
var one = Amount.ONE;
```

### `Engine`

```javascript
var Engine = require('currency-market').Engine;
```

`Engine` instances accept operations and return deltas that can be applied to simplified `State` instances.

#### Constructor

```javascript
// Define a commission rate of 0.5%
var COMMISSION_RATE = new Amount('0.005');

// instantiate an engine
var engine = new engine({
  // Optionally specify how commission should be applied to credits resulting from trades.
  // If this is not specified then no commission will be charged
  commission: {
    // The ID of the account to receive the commission
    account: 'commission',
    // The callback to use for calculating the commission amount to subtract from a credit
    // resulting from a trade
    calculate: function(params) {
      // A timestamp for the trade being executed
      var timestamp = params.timestamp;
      // The ID of the account that is being credited
      var account = params.account;
      // The currency of the credited amount
      var currency = params.currency;
      // The amount that is being credited as an Amount instance
      var amount = params.amount;

      // Return an object containing the amount of commission to deduct as an Amount
      // instance and a reference for the commission rate/type being charged
      //
      // Note that it's best to avoid divisions when calculating commissions so as
      // to avoid rounding errors. Also, as the reference is intended be transmitted along
      // with market deltas, it should be possible to convert it losslessly to and from JSON
      return {
        amount: amount.multiply(COMMISSION_RATE),
        reference: COMMISSION_RATE + '%'
      };
    }
  }
});
```

#### `apply` method

The `apply` method applies operations and returns the resulting deltas.

Operations and deltas can be converted losslessly to and from JSON for transmission.

If an operation fails for any reason (eg. not enough funds) then an error will be thrown.

Only operations that have been accepted using the `Operation.accept` method can be applied to an `Engine` instance.

```Javascript
try {
  var delta  = engine.apply(new Operation({
    // Operation parameters
    ...
  }));
} catch(error) {
  // Possible errors will include invalid parameters or insufficient funds to complete the operation
  ...
}
```

#### `JSON.stringify`

Engines can be converted to and from JSON

```Javascript
var json = JSON.stringify(engine);
var engine = new Engine({
  commission: {
    account: 'commission',
    calculate: function(params) {
      return {
        amount: amount.multiply(COMMISSION_RATE),
        reference: COMMISSION_RATE + '%'
      };
    }
  },
  json: json
});
```

### `Delta`

```javascript
var Delta = require('currency-market').Delta;
```

`Delta` instances are returned by `Engine` instances after successfully applying operations. They can be converted to JSON, transmitted, reconstructed from JSON and applied to `State` instances.

All deltas have the following properties

```Javascript
// The delta sequence number. These will be generated consecutively by the engine
// for successful operations. As such they will not be synchronized with operation sequence
// numbers due to the possibility of operations throwing errors
var sequence = delta.sequence;

// The operation instance as supplied to the `apply` method
var operation = delta.operation;

// Additional state change information in a format specific to the operation type
var result = delta.result;

```

#### `JSON.stringify`

Deltas can be converted to and from JSON

```Javascript
var json = JSON.stringify(delta);
var delta = new Delta({
  json: json
});
```

### `Operation`

```javascript
var Operation = require('currency-market').Operation;
```

`Operation` instances are submitted to `Engine` instances to apply operations. They can be converted to JSON, transmitted and reconstructed from JSON

All operations follow this pattern

```Javascript
var operation = new Operation({
  // Application specified reference that is returned untouched with the operation details included in the delta.
  // Care should be taken to ensure that this too can be converted to and from JSON
  reference: '550e8400-e29b-41d4-a716-446655440000',
  // The ID of the account submitting the operation
  account: 'Peter',
  // The operation details, the name of this property will determine the type of the operation
  // and what additional fields need to be supplied
  operationType: {
    // Operation parameters
    ...
  }
});
```

#### `accept` method

Operations must be accepted before they can be applied to an `Engine` instance to ensure they are associated with a sequence number and a timestamp

```Javascript
operation.accept({
  // The operation sequence number. These must be consecutive for consecutive operations
  sequence: 123456,
  // The timestamp for the operation as a Unix time since epoch in milliseconds
  timestamp: 1371737390976
});
```

#### `deposit` operation

Deposit funds into an account

```Javascript
var operation  = new Operation({
  reference: '550e8400-e29b-41d4-a716-446655440000',
  account: 'Peter',
  // deposit 1000 Euros to account ID 'Peter'
  deposit: {
    currency: 'EUR',
    amount: new Amount('1000')
  }
});

// On successful application the `delta.result` will have the following fields

// The new level of funds in the deposited currency as an `Amount` instance
var funds = delta.result.funds
```

#### `withdraw` operation

Withdraw funds from an account

```Javascript
var operation  = new Operation({
  reference: '550e8400-e29b-41d4-a716-446655440000',
  account: 'Peter',
  // withdraw 1000 Euros from account ID 'Peter'
  withdraw: {
    currency: 'EUR',
    amount: new Amount('1000')
  }
});

// On successful application the `delta.result` will have the following fields

// The new level of funds in the deposited currency as an `Amount` instance
var funds = delta.result.funds
```

#### `submit` operation

Submit orders to the market. Both bid and offer orders can be submitted and follow this pattern

```Javascript
var operation  = new Operation({
  reference: '550e8400-e29b-41d4-a716-446655440000',
  account: 'Peter',
  // Place a bid order for 10 BTC offering 100 Euros per BTC
  submit: {
    // order parameters
    ...
  }
});

// On successful application the `delta.result` will have the following fields

// The new level of locked funds in the order's offer currency
var lockedFunds = delta.result.lockedFunds

// Note that only one of `nextHigherOrderSequence` or `trades` will be set

// If the order is not at the top of the order book then the sequence number
// of the next order above it is returned. This is a hint to optimize the
// insertion of the order into a `State` instance
var nextHigherOrderSequence = delta.result.nextHigherOrderSequence;

// If the order was inserted at the top of the order book then an array of trades
// will be returned. This array will still be set, but will be empty, if no actual 
// trades were made
//
// Note that the price at which any trade was executed will be given by the bid or
// offer price associated with the `right` order and that the volume traded in each
// currency is most easily referenced by the debit amounts associated with the `left`
// and `right` accounts in their respective order's offer currencies
var trades = delta.result.trades;

  // `left` gives the changes to be applied to the order that was submitted and the
  // account that submitted it
  var left = trades[0].left;

    // Only one of `left` or `right` will have a remainder and this
    // signals the amount of the order that has not yet been executed.
    // When no remainder is specified it signals that the order was
    // completely executed. It is possible that neither `left` nor `right`
    // will have a remainder if they completely satisfy each other
    var remainder = left.remainder;

      // The remaining bidAmount on the order
      var bidAmount = remainder.bidAmount;

      // The remaining offerAmount on the order
      var offerAmount = remainder.offerAmount;

    // The transaction fields signal by how much the account balances have changed
    // and how much commission was applied
    var transaction = left.transaction;

      // The changes applied to the balance being debited
      var debit = transaction.debit;

        // The amount of the order's offer currency debited from the account
        var amount = debit.amount;

        // The new level of funds in the debited currency
        var funds = debit.funds;

        // The new level of locked funds in the debited currency
        var lockedFunds = debit.lockedFunds;

      // The changes applied to the balances being credited
      var credit = transaction.credit;

        // The amount of the order's bid currency credited to the account
        var amount = credit.amount;

        // The new level of funds in the credited currency
        var funds = credit.funds;

        // If the engine was instantiated with commission then the commission
        // field will be set
        var commission = credit.commission;

          // The amount of the order's bid currency credited to the commission account
          var amount = commission.amount;

          // The new level of funds in the order's bid currency in the commission account
          var funds = commission.funds;

          // The reference associated with the commission calculation
          var reference = commission.reference;

  // `right` gives the changes to be applied to the order that was matched and the
  // account that submitted it. This order will always be the order that is currently
  // at the top of the opposing order book to that which the submitted order was added.
  // The fields that can be set are the same as for `left`
  var right = trades[0].right;
```

##### Bid orders

```Javascript
var operation  = new Operation({
  reference: '550e8400-e29b-41d4-a716-446655440000',
  account: 'Peter',
  // Place a bid for 10 BTC offering 100 Euros per BTC
  submit: {
    bidCurrency: 'BTC',
    offerCurrency: 'EUR',
    bidPrice: new Amount('100'),
    bidAmount: new Amount('10')
  }
});
```

##### Offer orders

```Javascript
var operation  = new Operation({
  reference: '550e8400-e29b-41d4-a716-446655440000',
  account: 'Peter',
  // Place an offer of 1000 EUR bidding 0.01 BTC per EUR
  submit: {
    bidCurrency: 'BTC',
    offerCurrency: 'EUR',
    offerPrice: new Amount('0.01'),
    offerAmount: new Amount('1000')
  }
});
```

#### `cancel` operation

Orders can be cancelled using the cancel operation.

```Javascript
var operation  = new Operation({
  reference: '550e8400-e29b-41d4-a716-446655440000',
  account: 'Peter',
  // Cancel the order submitted by acount ID 'Peter' with operation sequence 615368 
  cancel: {
    sequence: 615368
  }
});

// On successful application the `delta.result` will have the following fields

// The new level of locked funds in the order's offer currency
var lockedFunds = delta.result.lockedFunds;
```

#### `JSON.stringify`

Operations can be converted to and from JSON

```Javascript
var json = JSON.stringify(operation);
var operation = new Operation({
  json: json
});
```

### `State`

```javascript
var State = require('currency-market').State;
```

`State` instances provide simplified access to a market state. They do not contain the logic for matching orders but do accept `Engine` generated deltas to keep them synchronized with `Engine` instances

#### Constructor

```javascript
// instantiate a state
var state = new State({
  commission:
    // Note that the commission acount name should match the commission
    // acount name from the engine to which this state will be synchronised
    account: 'commission'
});

// instantiate a state from JSON stringified engine
var state = new State({
  commission:
    account: 'commission'
  json: JSON.stringify(engine)
});
```

#### `apply` method

The `apply` method is used to apply deltas generated by `Engine` instances. The delta will be applied synchronously and errors may be thrown

```Javascript
try {
  state.apply(delta);
} catch(error) {
  // possible errors include out of sequence deltas 
  ...
}
```

#### `JSON.stringify`

States can be converted to and from JSON

```Javascript
var json = JSON.stringify(state);
var state = new State({
  json: json
});
```

#### `getBook` method

The `getBook` method gives access to the order books keyed by bid and offer currency. Each book is an `Array` of orders sorted as they will be matched for execution

```Javascript
var book = state.getBook({
  bidCurrency: 'BTC',
  offerCurrency: 'EUR'
});

// Get the top of the order book
var order = book[0];

// All orders have the following fields
//
// The sequence number
var sequence = order.sequence;
// The timestamp in milliseconds since epoch
var timestamp = order.timestamp;
// The account ID associated with the order
var account = order.account;
// The offer currency
var offerCurrency = order.offerCurrency;
// The bid currency
var bidCurrency = order.bidCurrency;

// Bid orders have the following additional fields

// The bid price as an `Amount` instance
var bidPrice = order.bidPrice;
// The bid amount as an `Amount` instance
var bidAmount = order.bidAmount;

// Offer orders have the following additional fields

// The offer price as an `Amount` instance
var offerPrice = order.offerPrice;
// The offer amount as an `Amount` instance
var offerAmount = order.offerAmount;
```

#### `getAccount` method

The `getAccount` method gives access to the accounts as instances of `Account` by account ID

```Javascript
var account = state.getAccount('Peter');
```

##### `Account`

The `Account` class gives access to the properties of an account

###### `orders` property

This is a collection of active orders keyed by sequence number (NB. it is an `Object` and not an `Array`)

```Javascript
var order = account.orders[5];
```

The orders are the same instances as those in the books retrieved with the `getBook` method

###### `getBalance` method

The `getBalance` method gives access to the balances of funds as instances of `Balance` associated with an account, keyed by currency

```Javascript
var balance = account.getBalance('EUR');
```

##### `Balance`

The `Balance` class gives access to the levels of funds and locked funds (when orders are outstanding) as `Amount` instances

```Javascript
var funds = balance.funds;
var lockedFunds = balance.lockedFunds;
```

## Roadmap

- Instant orders
  - Market orders
    - zero priced offers that are rejected if they cannot be completely filled by the market
      - if a zero price is used then any remainder cannot be left on the book as it may cause a division by zero
      - partial fills could be executed as long as the remainder is instantly cancelled
  - Fill or Kill limit orders?
    - will be tougher (less efficient) than market orders as an average price will have to be calculated?
- Pluggable rounding policies
  - Amount factory required?
  - currently we only round down debits and credits so as not to debit more funds than available
    - current rounding is done to an arbitrary scale of 25
- Separate transaction IDs and sequence IDs
  - Use sequence numbers instead of transaction IDs so the engine knows that it hasn't missed anything?
  - Use both sequence numbers and transaction IDs?
    - transaction IDs provide replayability
      - have to be unique forever (uuid?)
    - sequence numbers provide integrity checking
      - may get unweildy if required to be unique forever and could loop instead
      - where are sequence numbers assigned?
        - This implies a state somewhere and a centralised component (bottleneck?)
- Protection against attacks?
  - entering orders that satisfy each other
  - entering tiny orders
  - should this be in another layer?

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality.

Run tests with

```
$ npm test
```

Run performance tests with

```
$ npm run-script perf
```

## License
Copyright &copy; 2013 Peter Halliday  
Licensed under the MIT license.