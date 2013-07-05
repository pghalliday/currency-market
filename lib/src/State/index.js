(function() {
  var Account, Amount, State, convert,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Account = require('./Account');

  Amount = require('../Amount');

  convert = function(order) {
    order.bidPrice = order.bidPrice ? new Amount(order.bidPrice) : void 0;
    order.bidAmount = order.bidAmount ? new Amount(order.bidAmount) : void 0;
    order.offerPrice = order.offerPrice ? new Amount(order.offerPrice) : void 0;
    return order.offerAmount = order.offerAmount ? new Amount(order.offerAmount) : void 0;
  };

  module.exports = State = (function() {
    function State(params) {
      this.apply = __bind(this.apply, this);
      this.getBook = __bind(this.getBook, this);
      this.getBooks = __bind(this.getBooks, this);
      this.getAccount = __bind(this.getAccount, this);
      var account, bidCurrency, book, books, booksWithBidCurrency, id, json, offerCurrency, order, _i, _len, _ref, _ref1;
      this.accounts = {};
      this.books = {};
      this.nextDeltaSequence = 0;
      if (params) {
        json = params.json;
        if (json) {
          params = JSON.parse(json);
        }
        this.nextDeltaSequence = params.nextDeltaSequence;
        _ref = params.accounts;
        for (id in _ref) {
          account = _ref[id];
          this.accounts[id] = new Account(account);
        }
        _ref1 = params.books;
        for (bidCurrency in _ref1) {
          books = _ref1[bidCurrency];
          booksWithBidCurrency = this.getBooks(bidCurrency);
          for (offerCurrency in books) {
            book = books[offerCurrency];
            booksWithBidCurrency[offerCurrency] = book;
            for (_i = 0, _len = book.length; _i < _len; _i++) {
              order = book[_i];
              convert(order);
              this.accounts[order.account].orders[order.sequence] = order;
            }
          }
        }
      }
    }

    State.prototype.getAccount = function(id) {
      return this.accounts[id] = this.accounts[id] || new Account();
    };

    State.prototype.getBooks = function(bidCurrency) {
      return this.books[bidCurrency] = this.books[bidCurrency] || {};
    };

    State.prototype.getBook = function(params) {
      var bidCurrency, books, offerCurrency;
      bidCurrency = params.bidCurrency;
      if (bidCurrency) {
        books = this.getBooks(bidCurrency);
        offerCurrency = params.offerCurrency;
        if (offerCurrency) {
          return books[offerCurrency] = books[offerCurrency] || [];
        } else {
          throw new Error('Must supply an offer currency');
        }
      } else {
        throw new Error('Must supply a bid currency');
      }
    };

    State.prototype.apply = function(delta) {
      var account, before, book, deposit, index, nextHigherOrderSequence, operation, order, result, submit, withdraw, _i, _len, _results;
      if (delta.sequence === this.nextDeltaSequence) {
        this.nextDeltaSequence++;
        operation = delta.operation;
        result = delta.result;
        account = this.getAccount(operation.account);
        deposit = operation.deposit;
        withdraw = operation.withdraw;
        submit = operation.submit;
        if (deposit) {
          return account.getBalance(deposit.currency).funds = result.funds;
        } else if (withdraw) {
          return account.getBalance(withdraw.currency).funds = result.funds;
        } else if (submit) {
          order = {
            sequence: operation.sequence,
            timestamp: operation.timestamp,
            account: operation.account,
            bidCurrency: submit.bidCurrency,
            offerCurrency: submit.offerCurrency,
            bidPrice: submit.bidPrice,
            bidAmount: submit.bidAmount,
            offerPrice: submit.offerPrice,
            offerAmount: submit.offerAmount
          };
          account.orders[order.sequence] = order;
          account.getBalance(order.offerCurrency).lockedFunds = result.lockedFunds;
          book = this.getBook({
            bidCurrency: order.bidCurrency,
            offerCurrency: order.offerCurrency
          });
          nextHigherOrderSequence = result.nextHigherOrderSequence;
          if (typeof nextHigherOrderSequence !== 'undefined') {
            _results = [];
            for (index = _i = 0, _len = book.length; _i < _len; index = ++_i) {
              before = book[index];
              if (before.sequence === nextHigherOrderSequence) {
                _results.push(book.splice(index + 1, 0, order));
              } else {
                _results.push(void 0);
              }
            }
            return _results;
          } else {
            return book.splice(0, 0, order);
          }
        } else {
          throw new Error('Unknown operation');
        }
      } else if (delta.sequence > this.nextDeltaSequence) {
        throw new Error('Unexpected delta');
      }
    };

    return State;

  })();

}).call(this);
