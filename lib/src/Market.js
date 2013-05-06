(function() {
  var Account, Book, EventEmitter, Market,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Book = require('./Book');

  Account = require('./Account');

  EventEmitter = require('events').EventEmitter;

  module.exports = Market = (function(_super) {
    var execute;

    __extends(Market, _super);

    function Market() {
      this["export"] = __bind(this["export"], this);
      this.cancel = __bind(this.cancel, this);
      this.submit = __bind(this.submit, this);
      this.withdraw = __bind(this.withdraw, this);
      this.deposit = __bind(this.deposit, this);
      this.getBook = __bind(this.getBook, this);
      this.getAccount = __bind(this.getAccount, this);      this.accounts = Object.create(null);
      this.books = Object.create(null);
    }

    Market.prototype.getAccount = function(id) {
      var account;

      account = this.accounts[id];
      if (!account) {
        this.accounts[id] = account = new Account(id);
      }
      return account;
    };

    Market.prototype.getBook = function(bidCurrency, offerCurrency) {
      var book, books;

      books = this.books[bidCurrency];
      if (!books) {
        this.books[bidCurrency] = books = Object.create(null);
      }
      book = books[offerCurrency];
      if (!book) {
        books[offerCurrency] = book = new Book();
      }
      return book;
    };

    Market.prototype.deposit = function(deposit) {
      var account;

      if (deposit.id) {
        if (deposit.timestamp) {
          account = this.getAccount(deposit.account);
          account.deposit(deposit);
          this.lastTransaction = deposit.id;
          return this.emit('deposit', deposit);
        } else {
          throw new Error('Must supply timestamp');
        }
      } else {
        throw new Error('Must supply transaction ID');
      }
    };

    Market.prototype.withdraw = function(withdrawal) {
      var account;

      if (withdrawal.id) {
        if (withdrawal.timestamp) {
          account = this.getAccount(withdrawal.account);
          account.withdraw(withdrawal);
          this.lastTransaction = withdrawal.id;
          return this.emit('withdrawal', withdrawal);
        } else {
          throw new Error('Must supply timestamp');
        }
      } else {
        throw new Error('Must supply transaction ID');
      }
    };

    execute = function(leftBook, rightBook) {
      var leftOrder, rightOrder, tryAgain;

      leftOrder = leftBook.highest;
      rightOrder = rightBook.highest;
      if (leftOrder && rightOrder) {
        tryAgain = leftOrder.match(rightOrder);
        if (tryAgain) {
          return execute(leftBook, rightBook);
        }
      }
    };

    Market.prototype.submit = function(order) {
      var account, book,
        _this = this;

      account = this.getAccount(order.account);
      book = this.getBook(order.bidCurrency, order.offerCurrency);
      account.submit(order);
      book.submit(order);
      this.lastTransaction = order.id;
      order.on('trade', function(trade) {
        return _this.emit('trade', trade);
      });
      this.emit('order', order);
      return execute(book, this.getBook(order.offerCurrency, order.bidCurrency));
    };

    Market.prototype.cancel = function(cancellation) {
      var account, order;

      account = this.getAccount(cancellation.order.account);
      order = account.getBalance(cancellation.order.offerCurrency).offers[cancellation.order.id];
      if (order) {
        this.getBook(order.bidCurrency, order.offerCurrency).cancel(order);
        account.cancel(order);
        this.lastTransaction = cancellation.id;
        return this.emit('cancellation', cancellation);
      } else {
        throw new Error('Order cannot be found');
      }
    };

    Market.prototype["export"] = function() {
      var account, bidCurrency, book, books, id, object, offerCurrency, _ref, _ref1;

      object = Object.create(null);
      object.lastTransaction = this.lastTransaction;
      object.accounts = Object.create(null);
      _ref = this.accounts;
      for (id in _ref) {
        account = _ref[id];
        object.accounts[id] = account["export"]();
      }
      object.books = Object.create(null);
      _ref1 = this.books;
      for (bidCurrency in _ref1) {
        books = _ref1[bidCurrency];
        object.books[bidCurrency] = Object.create(null);
        for (offerCurrency in books) {
          book = books[offerCurrency];
          object.books[bidCurrency][offerCurrency] = book["export"]();
        }
      }
      return object;
    };

    return Market;

  })(EventEmitter);

}).call(this);
