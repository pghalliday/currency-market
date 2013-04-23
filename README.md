currency-market
===============

A synchronous implementation of a limit order based currencyMarket

Implemented:

The following functions complete synchronously and throw errors if they fail (ie. you don't have to wait for the events to know if they completed successfully)

* new CurrencyMarket(currencies) - constructor accepts an array of supported currencies
* currencyMarket.register(name) - add a new account using a unique name
* currencyMarket.deposit(deposit) - deposit funds to an account
* currencyMarket.withdraw(withdrawal) - withdraw funds from an account
* currencyMarket.submit(order) - submit a limit order to the currencyMarket (trades will be executed where possible)
* currencyMarket.cancel(order) - remove a limit order from the currencyMarket

The following events are emitted when successful changes are made to the currencyMarket. They are for the use of monitoring services

* currencyMarket.on('account', function(account) {}) - fired when a new account is successfully registered
* currencyMarket.on('deposit', function(deposit) {}) - fired when funds are successfully deposited
* currencyMarket.on('withdrawal', function(withdrawal) {}) - fired when funds are successfully withdrawn
* currencyMarket.on('order', function(order) {}) - fired when an order is successfully submitted
* currencyMarket.on('cancellation', function(order) {}) - fired when an order is successfully cancelled
* currencyMarket.on('trade', function(trade) {}) - fired when a trade is executed

The following properties are intended for public use

* currencyMarket.accounts - the collection of accounts keyed by account name
* currencyMarket.orders - the collection of orders currently active keyed by order ID
* currencyMarket.books - the collection of order books keyed by offer currency and then bid currency

TODO:

* should implement instant orders (execute or cancel)
* should implement rounding policies
* should implement simple commission
* should implement pluggable commission schemes
