(function() {
  var Amount, Book, Order, amount10, amount100, amount48Point5, amount48Point75, amount49, amount49Point5, amount49Point75, amount5, amount50, amount50Point5, amount50Point75, amount51, amount52, amount53, assert, chai, expect, newOrder;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  assert = chai.assert;

  Book = require('../../src/Engine/Book');

  Order = require('../../src/Engine/Order');

  Amount = require('../../src/Engine/Amount');

  amount5 = new Amount('5');

  amount10 = new Amount('10');

  amount48Point5 = new Amount('48.5');

  amount48Point75 = new Amount('48.75');

  amount49 = new Amount('49');

  amount49Point5 = new Amount('49.5');

  amount49Point75 = new Amount('49.75');

  amount50 = new Amount('50');

  amount50Point5 = new Amount('50.5');

  amount50Point75 = new Amount('50.75');

  amount51 = new Amount('51');

  amount52 = new Amount('52');

  amount53 = new Amount('53');

  amount100 = new Amount('100');

  newOrder = function(id, price) {
    return new Order({
      id: id,
      timestamp: '987654321',
      account: 'name',
      bidCurrency: 'BTC',
      offerCurrency: 'EUR',
      bidAmount: amount100,
      bidPrice: price
    });
  };

  describe('Book', function() {
    describe('#submit', function() {
      it('should keep track of the order with the highest bid price', function() {
        var book, order1, order10, order11, order12, order13, order14, order15, order2, order3, order4, order5, order6, order7, order8, order9;
        book = new Book();
        order1 = newOrder('1', amount50);
        book.submit(order1);
        book.next().should.equal(order1);
        order2 = newOrder('2', amount51);
        book.submit(order2);
        book.next().should.equal(order2);
        order3 = newOrder('3', amount49);
        book.submit(order3);
        book.next().should.equal(order2);
        order4 = newOrder('4', amount52);
        book.submit(order4);
        book.next().should.equal(order4);
        order5 = newOrder('5', amount50Point5);
        book.submit(order5);
        book.next().should.equal(order4);
        order6 = newOrder('6', amount49Point5);
        book.submit(order6);
        book.next().should.equal(order4);
        order7 = newOrder('7', amount48Point5);
        book.submit(order7);
        book.next().should.equal(order4);
        order8 = newOrder('8', amount48Point5);
        book.submit(order8);
        book.next().should.equal(order4);
        order9 = newOrder('9', amount48Point75);
        book.submit(order9);
        book.next().should.equal(order4);
        order10 = newOrder('10', amount49Point5);
        book.submit(order10);
        book.next().should.equal(order4);
        order11 = newOrder('11', amount49Point75);
        book.submit(order11);
        book.next().should.equal(order4);
        order12 = newOrder('12', amount50Point5);
        book.submit(order12);
        book.next().should.equal(order4);
        order13 = newOrder('13', amount50Point75);
        book.submit(order13);
        book.next().should.equal(order4);
        order14 = newOrder('14', amount52);
        book.submit(order14);
        book.next().should.equal(order4);
        order15 = newOrder('15', amount53);
        book.submit(order15);
        return book.next().should.equal(order15);
      });
      return describe('when the order fill event fires', function() {
        beforeEach(function() {
          this.book = new Book();
          this.order = new Order({
            id: '1',
            timestamp: '1',
            account: '123456789',
            offerCurrency: 'EUR',
            bidCurrency: 'BTC',
            bidPrice: amount100,
            bidAmount: amount10
          });
          return this.book.submit(this.order);
        });
        return it('should should delete the order from the book when the amount reaches ZERO', function() {
          var order;
          order = new Order({
            id: '2',
            timestamp: '2',
            account: '12345523',
            offerCurrency: 'BTC',
            bidCurrency: 'EUR',
            offerPrice: amount100,
            offerAmount: amount5
          });
          order.match(this.order);
          this.book.next().should.equal(this.order);
          order = new Order({
            id: '3',
            timestamp: '2',
            account: '12345523',
            offerCurrency: 'BTC',
            bidCurrency: 'EUR',
            offerPrice: amount100,
            offerAmount: amount10
          });
          order.match(this.order);
          return expect(this.book.next()).to.not.be.ok;
        });
      });
    });
    describe('#cancel', function() {
      beforeEach(function() {
        this.book = new Book();
        this.order1 = newOrder('1', amount50);
        this.book.submit(this.order1);
        this.order2 = newOrder('2', amount51);
        this.book.submit(this.order2);
        this.order3 = newOrder('3', amount49);
        this.book.submit(this.order3);
        this.order4 = newOrder('4', amount52);
        this.book.submit(this.order4);
        this.order5 = newOrder('5', amount50Point5);
        this.book.submit(this.order5);
        this.order6 = newOrder('6', amount49Point5);
        this.book.submit(this.order6);
        this.order7 = newOrder('7', amount48Point5);
        this.book.submit(this.order7);
        this.order8 = newOrder('8', amount48Point5);
        this.book.submit(this.order8);
        this.order9 = newOrder('9', amount48Point75);
        this.book.submit(this.order9);
        this.order10 = newOrder('10', amount49Point5);
        this.book.submit(this.order10);
        this.order11 = newOrder('11', amount49Point75);
        this.book.submit(this.order11);
        this.order12 = newOrder('12', amount50Point5);
        this.book.submit(this.order12);
        this.order13 = newOrder('13', amount50Point75);
        this.book.submit(this.order13);
        this.order14 = newOrder('14', amount52);
        this.book.submit(this.order14);
        this.order15 = newOrder('15', amount53);
        return this.book.submit(this.order15);
      });
      return it('should keep track of the order with the highest bid price', function() {
        this.book.cancel(this.order1);
        this.book.next().should.equal(this.order15);
        this.book.cancel(this.order12);
        this.book.next().should.equal(this.order15);
        this.book.cancel(this.order10);
        this.book.next().should.equal(this.order15);
        this.book.cancel(this.order6);
        this.book.next().should.equal(this.order15);
        this.book.cancel(this.order11);
        this.book.next().should.equal(this.order15);
        this.book.cancel(this.order8);
        this.book.next().should.equal(this.order15);
        this.book.cancel(this.order15);
        this.book.next().should.equal(this.order4);
        this.book.cancel(this.order4);
        this.book.next().should.equal(this.order14);
        this.book.cancel(this.order14);
        this.book.next().should.equal(this.order2);
        this.book.cancel(this.order2);
        this.book.next().should.equal(this.order13);
        this.book.cancel(this.order13);
        this.book.next().should.equal(this.order5);
        this.book.cancel(this.order5);
        this.book.next().should.equal(this.order3);
        this.book.cancel(this.order3);
        this.book.next().should.equal(this.order9);
        this.book.cancel(this.order9);
        this.book.next().should.equal(this.order7);
        this.book.cancel(this.order7);
        return expect(this.book.next()).to.not.be.ok;
      });
    });
    return describe('#export', function() {
      return it('should return a JSON stringifiable array containing a sorted list of orders in the book with the highest first', function() {
        var array, book, json, order1, order10, order11, order12, order13, order14, order15, order2, order3, order4, order5, order6, order7, order8, order9;
        book = new Book();
        order1 = newOrder('1', amount50);
        book.submit(order1);
        order2 = newOrder('2', amount51);
        book.submit(order2);
        order3 = newOrder('3', amount49);
        book.submit(order3);
        order4 = newOrder('4', amount52);
        book.submit(order4);
        order5 = newOrder('5', amount50Point5);
        book.submit(order5);
        order6 = newOrder('6', amount49Point5);
        book.submit(order6);
        order7 = newOrder('7', amount48Point5);
        book.submit(order7);
        order8 = newOrder('8', amount48Point5);
        book.submit(order8);
        order9 = newOrder('9', amount48Point75);
        book.submit(order9);
        order10 = newOrder('10', amount49Point5);
        book.submit(order10);
        order11 = newOrder('11', amount49Point75);
        book.submit(order11);
        order12 = newOrder('12', amount50Point5);
        book.submit(order12);
        order13 = newOrder('13', amount50Point75);
        book.submit(order13);
        order14 = newOrder('14', amount52);
        book.submit(order14);
        order15 = newOrder('15', amount53);
        book.submit(order15);
        json = JSON.stringify(book["export"]());
        array = JSON.parse(json);
        return array.should.deep.equal([order15["export"](), order4["export"](), order14["export"](), order2["export"](), order13["export"](), order5["export"](), order12["export"](), order1["export"](), order11["export"](), order6["export"](), order10["export"](), order3["export"](), order9["export"](), order7["export"](), order8["export"]()]);
      });
    });
  });

}).call(this);
