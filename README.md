currency-market
===============

A synchronous implementation of a limit order based currency market

## Features

- Supports an arbitrary list of currencies
- Synchronously executes trades as orders are added
- Emits events when changes are made to the market

## Installation

```
npm install currency-market
```

## API

All functions complete synchronously and throw errors if they fail.
Events are made available for monitoring changes in the market.

```javascript
var CurrencyMarket = require('currency-market');

// instantiate a market
var currencyMarket = new CurrencyMarket({
  currencies: [
    'EUR',
    'USD',
    'BTC'
  ]
});

// register for events
currencyMarket.on('account', function(account) {
  console.log(account);
});
currencyMarket.on('deposit', function(deposit) {
  console.log(deposit);
});
currencyMarket.on('withdrawal', function(withdrawal) {
  console.log(withdrawal);
});
currencyMarket.on('order', function(order) {
  console.log(order);
});
currencyMarket.on('cancellation', function(order) {
  console.log(order);
});
currencyMarket.on('trade', function(trade) {
  console.log(trade);
});

// add accounts
currencyMarket.register({
  id: 'Peter'
});
currencyMarket.register({
  id: 'Paul'
});

// make deposits
currencyMarket.deposit({
  account: 'Peter',
  currency: 'EUR',
  amount: '5000'
});
currencyMarket.deposit({
  account: 'Paul',
  currency: 'BTC',
  amount: '5000'
});

// make withdrawals
currencyMarket.withdraw({
  account: 'Peter',
  currency: 'EUR',
  amount: '1000'
});
currencyMarket.withdraw({
  account: 'Paul',
  currency: 'BTC',
  amount: '1000'
});

// submit orders
currencyMarket.submit({
  id: '1',
  timestamp: '1366758222',
  account: 'Peter',
  bidCurrency: 'BTC',
  offerCurrency: 'EUR',
  bidPrice: '2',
  bidAmount: '500'
});
currencyMarket.submit({
  id: '2',
  timestamp: '1366758245',
  account: 'Peter',
  bidCurrency: 'BTC',
  offerCurrency: 'EUR',
  bidPrice: '1',
  bidAmount: '2000'
});
currencyMarket.submit({
  id: '3',
  timestamp: '1366758256',
  account: 'Paul',
  bidCurrency: 'EUR',
  offerCurrency: 'BTC',
  offerPrice: '2',
  offerAmount: '250'
});
currencyMarket.submit({
  id: '4',
  timestamp: '1366758268',
  account: 'Paul',
  bidCurrency: 'EUR',
  offerCurrency: 'BTC',
  offerPrice: '3',
  offerAmount: '3000'
});

// cancel an order
currencyMarket.cancel({
  id: '1',
  timestamp: '1366758222',
  account: 'Peter',
  bidCurrency: 'BTC',
  offerCurrency: 'EUR',
  bidPrice: '2',
  bidAmount: '250'
});

// list all the active orders (keyed by id)
console.log(currencyMarket.orders);

// list all the active accounts (keyed by id)
console.log(currencyMarket.accounts);

// list all the active order books 
console.log(currencyMarket.books);

// Get the top of an order book
console.log(currencyMarket.books['EUR']['BTC'].highest);
console.log(currencyMarket.books['BTC']['EUR'].highest);
```

## Roadmap

- Export current state
- Initialise from known state
- require transaction id and timestamp with every state changing operation
  - register
  - deposit
  - withdraw
  - submit
  - cancel
- record the last transaction id
- state changed events should include the associated transaction ID and timestamp
  - account
  - deposit
  - withdrawal
  - order
  - cancellation
  - trade
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