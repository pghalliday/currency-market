currency-market
===============

[![Build Status](https://travis-ci.org/pghalliday/currency-market.png)](https://travis-ci.org/pghalliday/currency-market)

A synchronous implementation of a limit order based currency market

## Features

- Supports an arbitrary list of currencies
- Synchronously executes trades as orders are added
- Emits events when changes are made to the market
- Can export the state and initialise from an exported state
- Supports pluggable commission schemes

## Installation

```
npm install currency-market
```

## API

All functions and constructors complete synchronously and throw errors if they fail.
Events are made available for monitoring changes in the market.

```javascript
var Market = require('currency-market').Market;
var Account = require('currency-market').Account;
var Amount = require('currency-market').Amount;
var Order = require('currency-market').Order;


// Define a commission rate of 0.5%
var COMMISSION_RATE = new Amount('0.005');

// instantiate a market
var market = new Market({
  commission: {
    // The account ID of the account to receive the commission
    account: 'commission',
    // A callback to use for calculating the commission amount to subtract from a deposit
    // resulting from an order match
    calculate: function(params) {
      // The matched bid order corresponding to the deposit
      var bid = params.bid;
      // The amount to be deposited before commission (due to partial and better price
      // matches this amount may be different to the bidAmount from the bid order)
      var bidAmount = params.bidAmount;
      // The timestamp of the order that triggered the match (not necessarily from the bid
      // order, this is effectively the time that the trade was made)
      var timestamp = params.timestamp;
      // return the calculated commission amount to be subtracted from the deposit
      // and deposited in the commission account (it's best to avoid divisions
      // here in order to avoid rounding errors)
      return bidAmount.multiply(COMMISSION_RATE);
    }
  }
});

// register for events
market.on('deposit', function(deposit) {
  console.log('');
  console.log('********************');
  console.log('********************');
  console.log('');
  console.log('Deposit');
  console.log('');
  console.log('********************');
  console.log('********************');
  console.log('');
  console.log(deposit);
});
market.on('withdrawal', function(withdrawal) {
  console.log('');
  console.log('********************');
  console.log('********************');
  console.log('');
  console.log('Withdrawal');
  console.log('');
  console.log('********************');
  console.log('********************');
  console.log('');
  console.log(withdrawal);
});
market.on('order', function(order) {
  console.log('');
  console.log('********************');
  console.log('********************');
  console.log('');
  console.log('Order');
  console.log('');
  console.log('********************');
  console.log('********************');
  console.log('');
  console.log(order);
});
market.on('cancellation', function(cancellation) {
  console.log('');
  console.log('********************');
  console.log('********************');
  console.log('');
  console.log('Cancellation');
  console.log('');
  console.log('********************');
  console.log('********************');
  console.log('');
  console.log(cancellation);
});
market.on('trade', function(trade) {
  console.log('');
  console.log('********************');
  console.log('********************');
  console.log('');
  console.log('Trade');
  console.log('');
  console.log('********************');
  console.log('********************');
  console.log('');
  console.log(trade);
});

// make deposits
market.deposit({
  // All IDs are intended to be the transaction IDs and as such
  // should be globally unique. If not unique then the lastTransaction
  // field may be rendered meaningless preventing restoration from a 
  // saved transaction log.
  // Additionally these IDs are used to key collections so strange behaviour
  // may result if they are not unique
  id: '100002',
  // Although the timestamp is not used internally, it is required
  // so that any functionality hanging off the events can replicate
  // their time relative behaviour in case a Market has to be restored
  // from a transaction log
  timestamp: '1366758224',
  // Note that the acount field should be set to the unique ID of the account.
  // Accounts will be created and initialised on first reference
  account: 'Peter',
  currency: 'EUR',
  amount: new Amount('5000')
});
market.deposit({
  id: '100003',
  timestamp: '1366758225',
  account: 'Paul',
  currency: 'BTC',
  amount: new Amount('5000')
});

// make withdrawals
market.withdraw({
  id: '100004',
  timestamp: '1366758226',
  account: 'Peter',
  currency: 'EUR',
  amount: new Amount('1000')
});
market.withdraw({
  id: '100005',
  timestamp: '1366758227',
  account: 'Paul',
  currency: 'BTC',
  amount: new Amount('1000')
});

// submit orders
market.submit(new Order({
  id: '100006',
  timestamp: '1366758228',
  account: 'Peter',
  bidCurrency: 'BTC',
  offerCurrency: 'EUR',
  bidPrice: new Amount('2'),
  bidAmount: new Amount('500')
}));
market.submit(new Order({
  id: '100007',
  timestamp: '1366758229',
  account: 'Peter',
  bidCurrency: 'BTC',
  offerCurrency: 'EUR',
  bidPrice: new Amount('1'),
  bidAmount: new Amount('2000')
}));
market.submit(new Order({
  id: '100008',
  timestamp: '1366758230',
  account: 'Paul',
  bidCurrency: 'EUR',
  offerCurrency: 'BTC',
  offerPrice: new Amount('2'),
  offerAmount: new Amount('250')
}));
market.submit(new Order({
  id: '100009',
  timestamp: '1366758231',
  account: 'Paul',
  bidCurrency: 'EUR',
  offerCurrency: 'BTC',
  offerPrice: new Amount('3'),
  offerAmount: new Amount('3000')
}));

// cancel an order
market.cancel({
  id: '100010',
  timestamp: '1366758232',
  order: new Order({
    id: '100006',
    timestamp: '1366758228',
    account: 'Peter',
    bidCurrency: 'BTC',
    offerCurrency: 'EUR',
    bidPrice: new Amount('2'),
    bidAmount: new Amount('250')
  })
});

// Export an account as an object that can be converted to JSON
console.log('');
console.log('********************');
console.log('********************');
console.log('');
console.log('Peter\'s account');
console.log('');
console.log('********************');
console.log('********************');
console.log('');
console.log(market.getAccount('Peter').export());
console.log('');
console.log('********************');
console.log('********************');
console.log('');
console.log('Paul\'s account');
console.log('');
console.log('********************');
console.log('********************');
console.log('');
console.log(market.getAccount('Paul').export());
console.log('');
console.log('********************');
console.log('********************');
console.log('');
console.log('Commission account');
console.log('');
console.log('********************');
console.log('********************');
console.log('');
console.log(market.getAccount('commission').export());

// Export an order book as an array that can be converted to JSON
console.log('');
console.log('********************');
console.log('********************');
console.log('');
console.log('EUR bids in order');
console.log('');
console.log('********************');
console.log('********************');
console.log('');
console.log(market.getBook('EUR', 'BTC').export());
console.log('');
console.log('********************');
console.log('********************');
console.log('');
console.log('BTC bids in order');
console.log('');
console.log('********************');
console.log('********************');
console.log('');
console.log(market.getBook('BTC', 'EUR').export());

// export a snapshot of the market as an object that can be converted to JSON
var snapshot = market.export();

// JSON stringify the snapshot
var json = JSON.stringify(snapshot);
console.log('');
console.log('********************');
console.log('********************');
console.log('');
console.log('Stringified market snapshot');
console.log('');
console.log('********************');
console.log('********************');
console.log('');
console.log(json);

// initialise an identical market from the snapshot
var anotherMarket = new Market();
anotherMarket.import(JSON.parse(json));

// Retrieve the last transaction ID processed 
console.log('');
console.log('********************');
console.log('********************');
console.log('');
console.log('Last transaction ID from new Market: ' + anotherMarket.lastTransaction);
console.log('');
console.log('********************');
console.log('********************');
```

## Roadmap

- Refactor API

```javascript
var Engine = require('currency-market').Engine;
var State = require('currency-market').State;

var engine = new Engine({
  commission: {
    // The account ID of the account to receive the commission
    account: 'commission',
    // A callback to use for calculating the commission amount to subtract from a deposit
    // resulting from an order match
    calculate: function(params) {
      // The matched bid order corresponding to the deposit
      var bid = params.bid;
      // The amount to be deposited before commission (due to partial and better price
      // matches this amount may be different to the bidAmount from the bid order)
      var bidAmount = params.bidAmount;
      // The timestamp of the order that triggered the match (not necessarily from the bid
      // order, this is effectively the time that the trade was made)
      var timestamp = params.timestamp;
      // return the calculated commission amount to be subtracted from the deposit
      // and deposited in the commission account (it's best to avoid divisions
      // here in order to avoid rounding errors)
      return bidAmount.multiply(COMMISSION_RATE);
    }
  },
  state: {
    ?
  }
});

var state = new State(engine.export());

engine.apply({
  "reference": "550e8400-e29b-41d4-a716-446655440000",
  "account": "Peter",
  "sequence": 1234567890,
  "timestamp": 1371737390976,
  "deposit": {
    "currency": "EUR",
    "amount": "5000"
  }
});

engine.on('delta', function(delta) {
  // delta = {
  // "sequence": 1234567890,
  // "operation": {
  //   "reference": "550e8400-e29b-41d4-a716-446655440000",
  //   "account": "Peter",
  //   "sequence": 9876543210,
  //   "timestamp": 1371737390976,
  //   "result": "success",
  //   "deposit": {
  //     "currency": "EUR",
  //     "amount": "5000"
  //   }
  // };
  state.apply(delta);
});

var engine = new Engine({
  commission: {
    // The account ID of the account to receive the commission
    account: 'commission',
    // A callback to use for calculating the commission amount to subtract from a deposit
    // resulting from an order match
    calculate: function(params) {
      // The matched bid order corresponding to the deposit
      var bid = params.bid;
      // The amount to be deposited before commission (due to partial and better price
      // matches this amount may be different to the bidAmount from the bid order)
      var bidAmount = params.bidAmount;
      // The timestamp of the order that triggered the match (not necessarily from the bid
      // order, this is effectively the time that the trade was made)
      var timestamp = params.timestamp;
      // return the calculated commission amount to be subtracted from the deposit
      // and deposited in the commission account (it's best to avoid divisions
      // here in order to avoid rounding errors)
      return bidAmount.multiply(COMMISSION_RATE);
    }
  },
  state: state.export()
});

var engine = new Engine({
  commission: {
    // The account ID of the account to receive the commission
    account: 'commission',
    // A callback to use for calculating the commission amount to subtract from a deposit
    // resulting from an order match
    calculate: function(params) {
      // The matched bid order corresponding to the deposit
      var bid = params.bid;
      // The amount to be deposited before commission (due to partial and better price
      // matches this amount may be different to the bidAmount from the bid order)
      var bidAmount = params.bidAmount;
      // The timestamp of the order that triggered the match (not necessarily from the bid
      // order, this is effectively the time that the trade was made)
      var timestamp = params.timestamp;
      // return the calculated commission amount to be subtracted from the deposit
      // and deposited in the commission account (it's best to avoid divisions
      // here in order to avoid rounding errors)
      return bidAmount.multiply(COMMISSION_RATE);
    }
  },
  state: engine.export()
});

var account = state.getAccount('Peter');
var balance = account.getBalance('EUR');
etc...
```

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