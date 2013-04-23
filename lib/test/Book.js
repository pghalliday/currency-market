(function() {
  var Book, Order, assert, chai, expect, newOrder;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  assert = chai.assert;

  Book = require('../src/Book');

  Order = require('../src/Order');

  newOrder = function(id, price) {
    return new Order({
      id: id,
      timestamp: '987654321',
      account: 'name',
      bidCurrency: 'BTC',
      offerCurrency: 'EUR',
      bidAmount: '100',
      bidPrice: price
    });
  };

  describe('Book', function() {
    describe('#add', function() {
      return it('should keep track of the order with the highest bid price', function() {
        var book, order1, order10, order11, order12, order13, order14, order15, order2, order3, order4, order5, order6, order7, order8, order9;

        book = new Book();
        order1 = newOrder('1', '50');
        book.add(order1);
        book.highest.should.equal(order1);
        order2 = newOrder('2', '51');
        book.add(order2);
        book.highest.should.equal(order2);
        order3 = newOrder('3', '49');
        book.add(order3);
        book.highest.should.equal(order2);
        order4 = newOrder('4', '52');
        book.add(order4);
        book.highest.should.equal(order4);
        order5 = newOrder('5', '50.5');
        book.add(order5);
        book.highest.should.equal(order4);
        order6 = newOrder('6', '49.5');
        book.add(order6);
        book.highest.should.equal(order4);
        order7 = newOrder('7', '48.5');
        book.add(order7);
        book.highest.should.equal(order4);
        order8 = newOrder('8', '48.5');
        book.add(order8);
        book.highest.should.equal(order4);
        order9 = newOrder('9', '48.75');
        book.add(order9);
        book.highest.should.equal(order4);
        order10 = newOrder('10', '49.5');
        book.add(order10);
        book.highest.should.equal(order4);
        order11 = newOrder('11', '49.75');
        book.add(order11);
        book.highest.should.equal(order4);
        order12 = newOrder('12', '50.5');
        book.add(order12);
        book.highest.should.equal(order4);
        order13 = newOrder('13', '50.75');
        book.add(order13);
        book.highest.should.equal(order4);
        order14 = newOrder('14', '52');
        book.add(order14);
        book.highest.should.equal(order4);
        order15 = newOrder('15', '53');
        book.add(order15);
        return book.highest.should.equal(order15);
      });
    });
    return describe('#delete', function() {
      beforeEach(function() {
        this.book = new Book();
        this.order1 = newOrder('1', '50');
        this.book.add(this.order1);
        this.order2 = newOrder('2', '51');
        this.book.add(this.order2);
        this.order3 = newOrder('3', '49');
        this.book.add(this.order3);
        this.order4 = newOrder('4', '52');
        this.book.add(this.order4);
        this.order5 = newOrder('5', '50.5');
        this.book.add(this.order5);
        this.order6 = newOrder('6', '49.5');
        this.book.add(this.order6);
        this.order7 = newOrder('7', '48.5');
        this.book.add(this.order7);
        this.order8 = newOrder('8', '48.5');
        this.book.add(this.order8);
        this.order9 = newOrder('9', '48.75');
        this.book.add(this.order9);
        this.order10 = newOrder('10', '49.5');
        this.book.add(this.order10);
        this.order11 = newOrder('11', '49.75');
        this.book.add(this.order11);
        this.order12 = newOrder('12', '50.5');
        this.book.add(this.order12);
        this.order13 = newOrder('13', '50.75');
        this.book.add(this.order13);
        this.order14 = newOrder('14', '52');
        this.book.add(this.order14);
        this.order15 = newOrder('15', '53');
        return this.book.add(this.order15);
      });
      return it('should keep track of the order with the highest bid price', function() {
        this.book["delete"](this.order1);
        this.book.highest.should.equal(this.order15);
        this.book["delete"](this.order12);
        this.book.highest.should.equal(this.order15);
        this.book["delete"](this.order10);
        this.book.highest.should.equal(this.order15);
        this.book["delete"](this.order6);
        this.book.highest.should.equal(this.order15);
        this.book["delete"](this.order11);
        this.book.highest.should.equal(this.order15);
        this.book["delete"](this.order8);
        this.book.highest.should.equal(this.order15);
        this.book["delete"](this.order15);
        this.book.highest.should.equal(this.order4);
        this.book["delete"](this.order4);
        this.book.highest.should.equal(this.order14);
        this.book["delete"](this.order14);
        this.book.highest.should.equal(this.order2);
        this.book["delete"](this.order2);
        this.book.highest.should.equal(this.order13);
        this.book["delete"](this.order13);
        this.book.highest.should.equal(this.order5);
        this.book["delete"](this.order5);
        this.book.highest.should.equal(this.order3);
        this.book["delete"](this.order3);
        this.book.highest.should.equal(this.order9);
        this.book["delete"](this.order9);
        this.book.highest.should.equal(this.order7);
        this.book["delete"](this.order7);
        return expect(this.book.highest).to.not.be.ok;
      });
    });
  });

}).call(this);
