currency-market
===============

[![Build Status](https://travis-ci.org/pghalliday/currency-market.png)](https://travis-ci.org/pghalliday/currency-market)
[![Dependency Status](https://gemnasium.com/pghalliday/currency-market.png)](https://gemnasium.com/pghalliday/currency-market)

A synchronous implementation of a limit order based currency market

## Installation

```
npm install currency-market
```

## API

All functions complete synchronously and throw errors if they fail.

### `Amount`

`Amount` handles large numerical arithmetic accurately (unlike the built in Javascript number implementation). It is used for all internal numerical operations and is provided as a utility for applications to apply the same arimthmetic functionality in their own contexts. In particular it should be used in commission calculations.

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
var Amount.ZERO = new Amount('0');
var Amount.ONE = new Amount('1');
```

### `Engine`

`Engine` instances accept operations and return deltas that can be applied to simplified `State` instances.

#### Constructor

```javascript
var Engine = require('currency-market').Engine;
var Amount = require('currency-market').Amount;

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

All operations follow the same pattern

```Javascript

try {
  var delta  = engine.apply({
    // Application specified reference that is returned untouched with the operation details included in the delta.
    // Care should be taken to ensure that this too can be converted to and from JSON
    reference: '550e8400-e29b-41d4-a716-446655440000',
    // The ID of the account submitting the operation
    account: 'Peter',
    // The operation sequence number. These must be consecutive for consecutive operations
    sequence: 123456,
    // The timestamp for the operation as a Unix time since epoch in milliseconds
    timestamp: 1371737390976,
    // The operation details, the name of this property will determine the type of the operation
    // and what additional fields need to be supplied
    operationType: {
      // Operation parameters
      ...
    }
  });
} catch(error) {
  // Possible errors will include invalid parameters or insufficient funds to complete the operation
  ...
}

// The returned delta will have the following structure
var delta = {
  // The delta sequence number. These will be generated consecutively by the engine
  // for successful operations. As such they will not be synchronized with operation sequence
  // numbers due to the possibility of operations throwing errors
  sequence: 45632,
  // The operation parameters as supplied to the `apply` method
  operation: {
    reference: '550e8400-e29b-41d4-a716-446655440000',
    account: 'Peter',
    sequence: 123456,
    timestamp: 1371737390976,
    operationType: {
      // Operation parameters
      ...
    }
  },
  // Additional state change information
  result: {
    // Result properties
    ...
  }
};
```

##### `deposit` operation

Deposit funds into an account

```Javascript
var delta  = engine.apply({
  reference: '550e8400-e29b-41d4-a716-446655440000',
  account: 'Peter',
  sequence: 4562312,
  timestamp: 1371737390976,
  // deposit 1000 Euros to account ID 'Peter'
  deposit: {
    currency: 'EUR',
    // Strings are used for amounts and prices throughout to avoid issues with Javascript numbers
    amount: '1000'
  }
});

// The returned delta will have the following structure
var delta = {
  sequence: 35489,
  operation: {
    reference: '550e8400-e29b-41d4-a716-446655440000',
    account: 'Peter',
    sequence: 4562312,
    timestamp: 1371737390976,
    deposit: {
      currency: 'EUR',
      amount: '1000'
    }
  },
  result: {
    // The new level of funds in the deposited currency
    funds: '11000'
  }
};
```

##### `withdraw` operation

Withdraw funds from an account

```Javascript
var delta  = engine.apply({
  reference: '550e8400-e29b-41d4-a716-446655440000',
  account: 'Peter',
  sequence: 789652,
  timestamp: 1371737390976,
  // withdraw 1000 Euros from account ID 'Peter'
  withdraw: {
    currency: 'EUR',
    // Strings are used for amounts and prices throughout to avoid issues with Javascript numbers
    amount: '1000'
  }
});

// The returned delta will have the following structure
var delta = {
  sequence: 45872,
  operation: {
    reference: '550e8400-e29b-41d4-a716-446655440000',
    account: 'Peter',
    sequence: 789652,
    timestamp: 1371737390976,
    withdraw: {
      currency: 'EUR',
      amount: '1000'
    }
  },
  result: {
    // The new level of funds in the withdrawn currency
    funds: '9000'
  }
};
```

##### `submit` operation

Submit orders to the market. Both bid and offer orders can be submitted and follow this pattern

```Javascript
var delta  = engine.apply({
  reference: '550e8400-e29b-41d4-a716-446655440000',
  account: 'Peter',
  sequence: 654895,
  timestamp: 1371737390976,
  // Place a bid order for 10 BTC offering 100 Euros per BTC
  submit: {
    // order parameters
    ...
  }
});

// The returned delta will have the following structure
var delta = {
  sequence: 98546,
  operation: {
    reference: '550e8400-e29b-41d4-a716-446655440000',
    account: 'Peter',
    sequence: 654895,
    timestamp: 1371737390976,
    submit: {
      // order parameters
      ...
    }
  },
  result: {
    // The new level of locked funds in the order's offer currency
    lockedFunds: '45685.1234',

    // Note that only one of `nextHigherOrderSequence` or `trades` will be set

    // If the order is not at the top of the order book then the sequence number
    // of the next order above it is returned. This is a hint to optimize the
    // insertion of the order into a `State` instance
    nextHigherOrderSequence: 652973,

    // If the order was inserted at the top of the order book then an array of trades
    // will be returned. This array will still be set, but will be empty, if no actual 
    // trades were made
    //
    // Note that the price at which any trade was executed will be given by the bid or
    // offer price associated with the `right` order and that the volume traded in each
    // currency is most easily referenced by the debit amounts associated with the `left`
    // and `right` accounts in their respective order's offer currencies
    trades: [{
      // `left` gives the changes to be applied to the order that was submitted and the
      // account that submitted it
      left: {
        // Only one of `left` or `right` will have a remainder and this
        // signals the amount of the order that has not yet been executed.
        // When no remainder is specified it signals that the order was
        // completely executed. It is possible that neither `left` nor `right`
        // will have a remainder if they completely satisfy each other
        remainder: {
          // The remaining bidAmount on the order
          bidAmount: '12589.1335',
          // The remaining offerAmount on the order
          offerAmount: '3261.23',
        },
        // The transaction fields signal by how much the account balances have changed
        // and how much commission was applied
        transaction: {
          debit: {
            // The amount of the order's offer currency debited from the account
            amount: '6592.32697'
            // The new level of funds in the debited currency
            funds: '123498.132455'
            // The new level of locked funds in the debited currency
            lockedFunds: '38529.21558'
          },
          credit: {
            // The amount of the order's bid currency credited to the account
            amount: '326598.2356',
            // The new level of funds in the credited currency
            funds: '65489123.53658'
            // If the engine was instantiated without commission then the commission
            // field will not be set
            commission: {
              // The amount of the order's bid currency credited to the commission account
              amount: '326.123588',
              // The new level of funds in the order's bid currency in the commission account
              funds: '456432148131.45645645'
              // The reference associated with the commission calculation
              reference: '0.01%'
            }
          }
        }
      },
      // `right` gives the changes to be applied to the order that was matched and the
      // account that submitted it. This order will always be the order that is currently
      // at the top of the opposing order book to that which the submitted order was added
      right: {
        // The fields that can be set are the same as for `left`
        ...
      }
    }, ...]
  }
};
```

###### Bid orders

```Javascript
var delta  = engine.apply({
  reference: '550e8400-e29b-41d4-a716-446655440000',
  account: 'Peter',
  sequence: 0,
  timestamp: 1371737390976,
  // Place a bid for 10 BTC offering 100 Euros per BTC
  submit: {
    bidCurrency: 'BTC',
    offerCurrency: 'EUR',
    // Strings are used for amounts and prices throughout to avoid issues with Javascript numbers
    bidPrice: '100',
    bidAmount: '10'
  }
});
```

###### Offer orders

```Javascript
var delta  = engine.apply({
  reference: '550e8400-e29b-41d4-a716-446655440000',
  account: 'Peter',
  sequence: 0,
  timestamp: 1371737390976,
  // Place an offer of 1000 EUR bidding 0.01 BTC per EUR
  submit: {
    bidCurrency: 'BTC',
    offerCurrency: 'EUR',
    // Strings are used for amounts and prices throughout to avoid issues with Javascript numbers
    offerPrice: '0.01',
    offerAmount: '1000'
  }
});
```

##### `cancel` operation

Orders can be cancelled using the cancel operation.

```Javascript
var delta  = engine.apply({
  reference: '550e8400-e29b-41d4-a716-446655440000',
  account: 'Peter',
  sequence: 625879,
  timestamp: 1371737390976,
  // Cancel the order submitted by acount ID 'Peter' with operation sequence 615368 
  cancel: {
    sequence: 615368
  }
});

// The returned delta will have the following structure
var delta = {
  sequence: 35489,
  operation: {
    reference: '550e8400-e29b-41d4-a716-446655440000',
    account: 'Peter',
    sequence: 4562312,
    timestamp: 1371737390976,
    cancel: {
      sequence: 615368
    }
  },
  result: {
    // The index of the order in the book it is being removed from
    index: 5,
    // The new level of locked funds in the order's offer currency
    lockedFunds: '5216.9584'
  }
};
```

#### `export` method

The `export` method is used to export the current state of the market as an object that can be converted to and from JSON and used to reinitialise another `Engine` instance in the same state or initialize a synchronized `State` instance

```Javascript
var exported = engine.export();
```

#### `import` method

The `import` method is used to import a previously exported state

```Javascript
engine.import(exported);
```

### `State`

`State` instances provide simplified access to a market state. They do not contain the logic for matching orders but do accept `Engine` generated deltas to keep them synchronized with `Engine` instances


#### Constructor

```javascript
var State = require('currency-market').State;

// instantiate a state
var state = new State();
```

#### `import` method

The `import` method is used to import a previously exported state, either from another `State` instance or an `Engine` instance

```Javascript
state.import(exported);
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

#### `export` method

The `export` method is used to export the current state of the market as an object that can be converted to and from JSON and used to reinitialise another `State` instance in the same state

```Javascript
var exported = state.export();
```

## Roadmap

- Implement `State` as described above 
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

The CoffeeScript source is located in the `src/` directory and tests in the `test/` directory. Do not edit the contents of the `lib/` directory as this is compiled from the CoffeeScript source.

Before commiting run `npm test` to perform a clean compile of the source and run the tests. This ensures that everything commited is up to date and tested and allows people to `npm install` directly from the git repository (useful for integrating development branches, etc).

## License
Copyright &copy; 2013 Peter Halliday  
Licensed under the MIT license.