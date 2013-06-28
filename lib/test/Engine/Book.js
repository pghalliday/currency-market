(function() {
  var Account, Amount, Book, Order, amount10, amount100, amount1000, amount15, amount48Point5, amount48Point75, amount49, amount49Point5, amount49Point75, amount5, amount50, amount50Point5, amount50Point75, amount51, amount52, amount53, assert, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  assert = chai.assert;

  Book = require('../../src/Engine/Book');

  Order = require('../../src/Engine/Order');

  Amount = require('../../src/Amount');

  Account = require('../../src/Engine/Account');

  amount5 = new Amount('5');

  amount10 = new Amount('10');

  amount15 = new Amount('15');

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

  amount1000 = new Amount('1000');

  describe('Book', function() {
    beforeEach(function() {
      var sequence, timestamp,
        _this = this;
      sequence = 0;
      timestamp = 1371737390976;
      this.book = new Book({
        bidCurrency: 'BTC',
        offerCurrency: 'EUR'
      });
      this.account = new Account({
        id: 'Peter'
      });
      this.newBid = function(price) {
        return new Order({
          sequence: sequence++,
          timestamp: timestamp++,
          account: _this.account,
          book: _this.book,
          bidPrice: price,
          bidAmount: amount50
        });
      };
      return this.newOffer = function(price) {
        return new Order({
          sequence: sequence++,
          timestamp: timestamp++,
          account: _this.account,
          book: _this.book,
          offerPrice: price,
          offerAmount: amount50
        });
      };
    });
    it('should error if no bid currency is supplied', function() {
      return expect(function() {
        var book;
        return book = new Book({
          offerCurrency: 'EUR'
        });
      }).to["throw"]('Must supply a bid currency');
    });
    it('should error if no offer currency is supplied', function() {
      return expect(function() {
        var book;
        return book = new Book({
          bidCurrency: 'BTC'
        });
      }).to["throw"]('Must supply an offer currency');
    });
    describe('#submit', function() {
      it('should keep track of the order with the highest bid price and return the sequence of the next higher order or undefined if it is the highest', function() {
        var nextHigher, order1, order10, order11, order12, order13, order14, order15, order2, order3, order4, order5, order6, order7, order8, order9;
        order1 = this.newBid(amount50);
        nextHigher = this.book.submit(order1);
        this.book.next().should.equal(order1);
        expect(nextHigher).to.not.be.ok;
        order2 = this.newBid(amount51);
        nextHigher = this.book.submit(order2);
        this.book.next().should.equal(order2);
        expect(nextHigher).to.not.be.ok;
        order3 = this.newBid(amount49);
        nextHigher = this.book.submit(order3);
        this.book.next().should.equal(order2);
        nextHigher.should.equal(order1);
        order4 = this.newBid(amount52);
        nextHigher = this.book.submit(order4);
        this.book.next().should.equal(order4);
        expect(nextHigher).to.not.be.ok;
        order5 = this.newBid(amount50Point5);
        nextHigher = this.book.submit(order5);
        this.book.next().should.equal(order4);
        nextHigher.should.equal(order2);
        order6 = this.newBid(amount49Point5);
        nextHigher = this.book.submit(order6);
        this.book.next().should.equal(order4);
        nextHigher.should.equal(order1);
        order7 = this.newBid(amount48Point5);
        nextHigher = this.book.submit(order7);
        this.book.next().should.equal(order4);
        nextHigher.should.equal(order3);
        order8 = this.newBid(amount48Point5);
        nextHigher = this.book.submit(order8);
        this.book.next().should.equal(order4);
        nextHigher.should.equal(order7);
        order9 = this.newBid(amount48Point75);
        nextHigher = this.book.submit(order9);
        this.book.next().should.equal(order4);
        nextHigher.should.equal(order3);
        order10 = this.newBid(amount49Point5);
        nextHigher = this.book.submit(order10);
        this.book.next().should.equal(order4);
        nextHigher.should.equal(order6);
        order11 = this.newBid(amount49Point75);
        nextHigher = this.book.submit(order11);
        this.book.next().should.equal(order4);
        nextHigher.should.equal(order1);
        order12 = this.newBid(amount50Point5);
        nextHigher = this.book.submit(order12);
        this.book.next().should.equal(order4);
        nextHigher.should.equal(order5);
        order13 = this.newBid(amount50Point75);
        nextHigher = this.book.submit(order13);
        this.book.next().should.equal(order4);
        nextHigher.should.equal(order2);
        order14 = this.newBid(amount52);
        nextHigher = this.book.submit(order14);
        this.book.next().should.equal(order4);
        nextHigher.should.equal(order4);
        order15 = this.newBid(amount53);
        nextHigher = this.book.submit(order15);
        this.book.next().should.equal(order15);
        return expect(nextHigher).to.not.be.ok;
      });
      return it('should handle bids and offers in the same book', function() {
        var order1, order2;
        order1 = this.newBid(amount50);
        this.book.submit(order1);
        order2 = this.newOffer(amount50);
        return this.book.submit(order2);
      });
    });
    describe('#cancel', function() {
      beforeEach(function() {
        this.order1 = this.newBid(amount50);
        this.book.submit(this.order1);
        this.order2 = this.newBid(amount51);
        this.book.submit(this.order2);
        this.order3 = this.newBid(amount49);
        this.book.submit(this.order3);
        this.order4 = this.newBid(amount52);
        this.book.submit(this.order4);
        this.order5 = this.newBid(amount50Point5);
        this.book.submit(this.order5);
        this.order6 = this.newBid(amount49Point5);
        this.book.submit(this.order6);
        this.order7 = this.newBid(amount48Point5);
        this.book.submit(this.order7);
        this.order8 = this.newBid(amount48Point5);
        this.book.submit(this.order8);
        this.order9 = this.newBid(amount48Point75);
        this.book.submit(this.order9);
        this.order10 = this.newBid(amount49Point5);
        this.book.submit(this.order10);
        this.order11 = this.newBid(amount49Point75);
        this.book.submit(this.order11);
        this.order12 = this.newBid(amount50Point5);
        this.book.submit(this.order12);
        this.order13 = this.newBid(amount50Point75);
        this.book.submit(this.order13);
        this.order14 = this.newBid(amount52);
        this.book.submit(this.order14);
        this.order15 = this.newBid(amount53);
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
        var array, json, order1, order10, order11, order12, order13, order14, order15, order2, order3, order4, order5, order6, order7, order8, order9;
        order1 = this.newBid(amount50);
        this.book.submit(order1);
        order2 = this.newBid(amount51);
        this.book.submit(order2);
        order3 = this.newBid(amount49);
        this.book.submit(order3);
        order4 = this.newBid(amount52);
        this.book.submit(order4);
        order5 = this.newBid(amount50Point5);
        this.book.submit(order5);
        order6 = this.newBid(amount49Point5);
        this.book.submit(order6);
        order7 = this.newBid(amount48Point5);
        this.book.submit(order7);
        order8 = this.newBid(amount48Point5);
        this.book.submit(order8);
        order9 = this.newBid(amount48Point75);
        this.book.submit(order9);
        order10 = this.newBid(amount49Point5);
        this.book.submit(order10);
        order11 = this.newBid(amount49Point75);
        this.book.submit(order11);
        order12 = this.newBid(amount50Point5);
        this.book.submit(order12);
        order13 = this.newBid(amount50Point75);
        this.book.submit(order13);
        order14 = this.newBid(amount52);
        this.book.submit(order14);
        order15 = this.newBid(amount53);
        this.book.submit(order15);
        json = JSON.stringify(this.book["export"]());
        array = JSON.parse(json);
        return array.should.deep.equal([order15["export"](), order4["export"](), order14["export"](), order2["export"](), order13["export"](), order5["export"](), order12["export"](), order1["export"](), order11["export"](), order6["export"](), order10["export"](), order3["export"](), order9["export"](), order7["export"](), order8["export"]()]);
      });
    });
  });

}).call(this);
