(function() {
  var Account, State,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Account = require('./Account');

  module.exports = State = (function() {
    function State(state) {
      this.apply = __bind(this.apply, this);
      this.getAccount = __bind(this.getAccount, this);
      var account, bidCurrency, book, books, id, offerCurrency, order, _fn, _i, _len, _ref, _ref1,
        _this = this;
      this.accounts = Object.create(null);
      this.nextSequence = 0;
      if (state) {
        this.nextSequence = state.nextDeltaSequence;
        _ref = state.accounts;
        for (id in _ref) {
          account = _ref[id];
          this.accounts[id] = new Account(account);
        }
        _ref1 = state.books;
        for (bidCurrency in _ref1) {
          books = _ref1[bidCurrency];
          for (offerCurrency in books) {
            book = books[offerCurrency];
            _fn = function(order) {
              return _this.accounts[order.account].orders[order.sequence] = order;
            };
            for (_i = 0, _len = book.length; _i < _len; _i++) {
              order = book[_i];
              _fn(order);
            }
          }
        }
      }
    }

    State.prototype.getAccount = function(id) {
      return this.accounts[id] = this.accounts[id] || new Account();
    };

    State.prototype.apply = function(delta) {
      var account, deposit, operation, result;
      if (delta.sequence === this.nextSequence) {
        this.nextSequence++;
        operation = delta.operation;
        result = delta.result;
        account = this.getAccount(operation.account);
        deposit = operation.deposit;
        if (deposit) {
          return account.getBalance(deposit.currency).funds = result.funds;
        } else {
          throw new Error('Unknown operation');
        }
      } else if (delta.sequence > this.nextSequence) {
        throw new Error('Unexpected delta');
      }
    };

    return State;

  })();

}).call(this);
