currency-market
===============

A synchronous implementation of a limit order based currency market

## Features

- Supports an arbitrary list of currencies
- Synchronously executes trades as orders are added
- Emits events when changes are made to the market
- Can export the state and initialise from an exported state

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

// instantiate a market
var market = new Market({
  currencies: [
    'EUR',
    'USD',
    'BTC'
  ]
});

// register for events
market.on('account', function(account) {
  console.log('');
  console.log('********************');
  console.log('********************');
  console.log('');
  console.log('Account');
  console.log('');
  console.log('********************');
  console.log('********************');
  console.log('');
  console.log(account);
});
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

// add accounts
market.register(new Account({
  id: '100000',
  timestamp: '1366758222',
  currencies: [
    'EUR',
    'USD',
    'BTC'
  ]
}));
market.register(new Account({
  id: '100001',
  timestamp: '1366758223',
  currencies: [
    'EUR',
    'USD',
    'BTC'
  ]
}));

// make deposits
market.deposit({
  id: '100002',
  timestamp: '1366758224',
  account: '100000',
  currency: 'EUR',
  amount: new Amount('5000')
});
market.deposit({
  id: '100003',
  timestamp: '1366758225',
  account: '100001',
  currency: 'BTC',
  amount: new Amount('5000')
});

// make withdrawals
market.withdraw({
  id: '100004',
  timestamp: '1366758226',
  account: '100000',
  currency: 'EUR',
  amount: new Amount('1000')
});
market.withdraw({
  id: '100005',
  timestamp: '1366758227',
  account: '100001',
  currency: 'BTC',
  amount: new Amount('1000')
});

// submit orders
market.submit(new Order({
  id: '100006',
  timestamp: '1366758228',
  account: '100000',
  bidCurrency: 'BTC',
  offerCurrency: 'EUR',
  bidPrice: new Amount('2'),
  bidAmount: new Amount('500')
}));
market.submit(new Order({
  id: '100007',
  timestamp: '1366758229',
  account: '100000',
  bidCurrency: 'BTC',
  offerCurrency: 'EUR',
  bidPrice: new Amount('1'),
  bidAmount: new Amount('2000')
}));
market.submit(new Order({
  id: '100008',
  timestamp: '1366758230',
  account: '100001',
  bidCurrency: 'EUR',
  offerCurrency: 'BTC',
  offerPrice: new Amount('2'),
  offerAmount: new Amount('250')
}));
market.submit(new Order({
  id: '100009',
  timestamp: '1366758231',
  account: '100001',
  bidCurrency: 'EUR',
  offerCurrency: 'BTC',
  offerPrice: new Amount('3'),
  offerAmount: new Amount('3000')
}));

// cancel an order (this will match because 250 BTC was already traded on this order)
market.cancel({
  id: '100010',
  timestamp: '1366758232',
  order: new Order({
    id: '100006',
    timestamp: '1366758228',
    account: '100000',
    bidCurrency: 'BTC',
    offerCurrency: 'EUR',
    bidPrice: new Amount('2'),
    bidAmount: new Amount('250')
  })
});

// list all the active accounts (keyed by id)
console.log('');
console.log('********************');
console.log('********************');
console.log('');
console.log('Accounts');
console.log('');
console.log('********************');
console.log('********************');
console.log('');
console.log(market.accounts);

// list all the active order books 
console.log('');
console.log('********************');
console.log('********************');
console.log('');
console.log('Books');
console.log('');
console.log('********************');
console.log('********************');
console.log('');
console.log(market.books);

// Get the top of an order book
console.log('');
console.log('********************');
console.log('********************');
console.log('');
console.log('Highest EUR bid');
console.log('');
console.log('********************');
console.log('********************');
console.log('');
console.log(market.books['EUR']['BTC'].highest);
console.log('');
console.log('********************');
console.log('********************');
console.log('');
console.log('Highest BTC bid');
console.log('');
console.log('********************');
console.log('********************');
console.log('');
console.log(market.books['BTC']['EUR'].highest);

// export the state (as an object that can be converted to JSON)
var state  = market.export();

// JSON stringify the state
var json = JSON.stringify(state);
console.log('');
console.log('********************');
console.log('********************');
console.log('');
console.log('Stringified market state');
console.log('');
console.log('********************');
console.log('********************');
console.log('');
console.log(json);

// initialise an identical market from the state
var anotherMarket = new Market({
  state: JSON.parse(json)
});
```

## Roadmap

- Instant orders
  - Fill or Kill limit orders
  - Market orders
- Pluggable commission schemes
  - fixed rate
  - calculated through callback
- Pluggable rounding policies
  - Amount factory required?
  - Divide at last possible moment?

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality.

The CoffeeScript source is located in the `src/` directory and tests in the `test/` directory. Do not edit the contents of the `lib/` directory as this is compiled from the CoffeeScript source.

Before commiting run `npm test` to perform a clean compile of the source and run the tests. This ensures that everything commited is up to date and tested and allows people to `npm install` directly from the git repository (useful for integrating development branches, etc).

## License
Copyright (c) 2013 Peter Halliday  
Licensed under the MIT license.