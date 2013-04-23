SimpleOrderBook
===============

A simple node implementation of a Limit Order Book and Balances

Implemented:

* new Market(currencies) - constructor accepts array list of supported currencies
* Market.addAccount(name) - add a new account using a unique name
* Market.deposit(deposit) - deposit funds to an account
* Market.withdraw(withdrawal) - withdraw funds from an account
* Market.add(order) - add a limit order to the market (trades will be executed where possible)
* Market.delete(order) - remove a limit order from the market

TODO:

* should implement instant orders (execute or cancel)
* should implement simple commission
* should implement pluggable commission schemes
* should support punishment mode?
  * enter orders on behalf of the exchange to fill the gap between bids that overshoot offers instead of executing at best prices for the later order