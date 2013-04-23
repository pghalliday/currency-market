SimpleOrderBook
===============

A simple node implementation of a Limit Order Book and Balances

Implemented:

The following functions complete synchronously and throw errors if they fail (ie. you don't have to wait for the events to know if they completed successfully)

* new Market(currencies) - constructor accepts an array of supported currencies
* market.register(name) - add a new account using a unique name
* market.deposit(deposit) - deposit funds to an account
* market.withdraw(withdrawal) - withdraw funds from an account
* market.add(order) - add a limit order to the market (trades will be executed where possible)
* market.delete(order) - remove a limit order from the market

The following events are emitted when successful changes are made to the market. They are for the use of monitoring services

* market.on('account', function(account) {}) - fired when a new account is successfully registered
* market.on('deposit', function(deposit) {}) - fired when funds are successfully deposited
* market.on('withdrawal', function(withdrawal) {}) - fired when funds are successfully withdrawn
* market.on('order', function(order) {}) - fired when an order is successfully added
* market.on('cancellation', function(order) {}) - fired when an order is successfully deleted
* market.on('trade', function(trade) {}) - fired when a trade is executed

The following properties are intended for public use

* market.accounts - the collection of accounts keyed by account name
* market.orders - the collection of orders currently active keyed by order ID
* market.books - the collection of order books keyed by offer currency and then bid currency

TODO:

* should implement instant orders (execute or cancel)
* should implement simple commission
* should implement pluggable commission schemes
* should support punishment mode?
  * enter orders on behalf of the exchange to fill the gap between bids that overshoot offers instead of executing at best prices for the later order