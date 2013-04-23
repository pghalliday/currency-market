(function() {
  var Account, Amount, Book, CurrencyMarket, EventEmitter, Order,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Account = require('./Account');

  Book = require('./Book');

  Order = require('./Order');

  Amount = require('./Amount');

  EventEmitter = require('events').EventEmitter;

  module.exports = CurrencyMarket = (function(_super) {
    __extends(CurrencyMarket, _super);

    function CurrencyMarket(params) {
      this.cancel = __bind(this.cancel, this);
      this.execute = __bind(this.execute, this);
      this.submit = __bind(this.submit, this);
      this.withdraw = __bind(this.withdraw, this);
      this.deposit = __bind(this.deposit, this);
      this.register = __bind(this.register, this);
      var _this = this;

      this.accounts = Object.create(null);
      this.orders = Object.create(null);
      this.books = Object.create(null);
      this.currencies = params.currencies;
      this.currencies.forEach(function(bidCurrency) {
        _this.books[bidCurrency] = Object.create(null);
        return _this.currencies.forEach(function(orderCurrency) {
          if (bidCurrency !== orderCurrency) {
            return _this.books[bidCurrency][orderCurrency] = new Book();
          }
        });
      });
    }

    CurrencyMarket.prototype.register = function(params) {
      if (this.accounts[params.id]) {
        throw new Error('Account already exists');
      } else {
        this.accounts[params.id] = new Account({
          id: params.id,
          currencies: this.currencies
        });
        return this.emit('account', this.accounts[params.id]);
      }
    };

    CurrencyMarket.prototype.deposit = function(deposit) {
      var account, balance;

      account = this.accounts[deposit.account];
      if (typeof account === 'undefined') {
        throw new Error('Account does not exist');
      } else {
        balance = account.balances[deposit.currency];
        if (typeof balance === 'undefined') {
          throw new Error('Currency is not supported');
        } else {
          balance.deposit(new Amount(deposit.amount));
          return this.emit('deposit', deposit);
        }
      }
    };

    CurrencyMarket.prototype.withdraw = function(withdrawal) {
      var account, balance;

      account = this.accounts[withdrawal.account];
      if (typeof account === 'undefined') {
        throw new Error('Account does not exist');
      } else {
        balance = account.balances[withdrawal.currency];
        if (typeof balance === 'undefined') {
          throw new Error('Currency is not supported');
        } else {
          balance.withdraw(new Amount(withdrawal.amount));
          return this.emit('withdrawal', withdrawal);
        }
      }
    };

    CurrencyMarket.prototype.submit = function(params) {
      var account, balance, book, books, order;

      order = new Order(params);
      account = this.accounts[order.account];
      if (typeof account === 'undefined') {
        throw new Error('Account does not exist');
      } else {
        balance = account.balances[order.offerCurrency];
        if (typeof balance === 'undefined') {
          throw new Error('Offer currency is not supported');
        } else {
          books = this.books[order.bidCurrency];
          if (typeof books === 'undefined') {
            throw new Error('Bid currency is not supported');
          } else {
            book = books[order.offerCurrency];
            balance.lock(order.offerAmount);
            book.add(order);
            this.orders[order.id] = order;
            this.emit('order', order);
            return this.execute(book, this.books[order.offerCurrency][order.bidCurrency]);
          }
        }
      }
    };

    CurrencyMarket.prototype.execute = function(leftBook, rightBook) {
      var leftBalances, leftBidAmount, leftBidCurrency, leftOfferAmount, leftOfferCurrency, leftOfferReduction, leftOrder, rightBalances, rightBidAmount, rightOfferAmount, rightOrder;

      leftOrder = leftBook.highest;
      rightOrder = rightBook.highest;
      if (typeof leftOrder !== 'undefined' && typeof rightOrder !== 'undefined') {
        if (leftOrder.bidPrice.compareTo(rightOrder.offerPrice) >= 0) {
          leftBalances = this.accounts[leftOrder.account].balances;
          rightBalances = this.accounts[rightOrder.account].balances;
          leftOfferCurrency = leftOrder.offerCurrency;
          leftBidCurrency = leftOrder.bidCurrency;
          rightBidAmount = rightOrder.bidAmount;
          rightOfferAmount = rightOrder.offerAmount;
          if (leftOrder.fillOffer) {
            leftOfferAmount = leftOrder.offerAmount;
            leftBidAmount = leftOrder.offerAmount.multiply(rightOrder.bidPrice);
            leftOfferReduction = rightOfferAmount.multiply(rightOrder.offerPrice);
          } else {
            leftBidAmount = leftOrder.bidAmount;
            leftOfferAmount = leftBidAmount.multiply(rightOrder.offerPrice);
            leftOfferReduction = rightOfferAmount.multiply(leftOrder.bidPrice);
          }
          if (leftOfferAmount.compareTo(rightBidAmount) > 0) {
            leftBalances[leftOfferCurrency].unlock(leftOfferReduction);
            leftBalances[leftOfferCurrency].withdraw(rightBidAmount);
            rightBalances[leftOfferCurrency].deposit(rightBidAmount);
            rightBalances[leftBidCurrency].unlock(rightOfferAmount);
            rightBalances[leftBidCurrency].withdraw(rightOfferAmount);
            leftBalances[leftBidCurrency].deposit(rightOfferAmount);
            rightBook["delete"](rightOrder);
            delete this.orders[rightOrder.id];
            leftOrder.reduceOffer(leftOfferReduction);
            this.emit('trade', {
              left: {
                currency: leftBidCurrency,
                amount: rightOfferAmount.toString(),
                price: rightOrder.offerPrice.toString(),
                account: leftOrder.account
              },
              right: {
                currency: leftOfferCurrency,
                amount: rightBidAmount.toString(),
                price: rightOrder.bidPrice.toString(),
                account: rightOrder.account
              }
            });
            return this.execute(leftBook, rightBook);
          } else {
            leftBalances[leftOfferCurrency].unlock(leftOrder.offerAmount);
            leftBalances[leftOfferCurrency].withdraw(leftOfferAmount);
            rightBalances[leftOfferCurrency].deposit(leftOfferAmount);
            rightBalances[leftBidCurrency].unlock(leftBidAmount);
            rightBalances[leftBidCurrency].withdraw(leftBidAmount);
            leftBalances[leftBidCurrency].deposit(leftBidAmount);
            leftBook["delete"](leftOrder);
            delete this.orders[leftOrder.id];
            rightOrder.reduceBid(leftOfferAmount);
            if (rightOrder.bidAmount.compareTo(Amount.ZERO) === 0) {
              rightBook["delete"](rightOrder);
              delete this.orders[rightOrder.id];
            }
            return this.emit('trade', {
              left: {
                currency: leftBidCurrency,
                amount: leftBidAmount.toString(),
                price: rightOrder.offerPrice.toString(),
                account: leftOrder.account
              },
              right: {
                currency: leftOfferCurrency,
                amount: leftOfferAmount.toString(),
                price: rightOrder.bidPrice.toString(),
                account: rightOrder.account
              }
            });
          }
        }
      }
    };

    CurrencyMarket.prototype.cancel = function(params) {
      var match, order;

      match = new Order(params);
      order = this.orders[match.id];
      if (typeof order === 'undefined') {
        throw new Error('Order cannot be found');
      } else {
        if (order.equals(match)) {
          delete this.orders[order.id];
          this.books[order.bidCurrency][order.offerCurrency]["delete"](order);
          this.accounts[order.account].balances[order.offerCurrency].unlock(order.offerAmount);
          return this.emit('cancellation', params);
        } else {
          throw new Error('Order does not match');
        }
      }
    };

    return CurrencyMarket;

  })(EventEmitter);

}).call(this);
