var CurrencyMarket = require('../');

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

// export the state (as an object that can be converted to JSON)
var state  = currencyMarket.export();

// JSON stringify the state
var json = JSON.stringify(state);
console.log(json);

// initialise an identical market from the state
var anotherCurrencyMarket = new CurrencyMarket({
  state: JSON.parse(json)
});