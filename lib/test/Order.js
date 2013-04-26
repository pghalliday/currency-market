(function() {
  var Amount, Order, assert, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  assert = chai.assert;

  Order = require('../src/Order');

  Amount = require('../src/Amount');

  describe('Order', function() {
    it('should throw an error if the ID is missing', function() {
      return expect(function() {
        var order;

        return order = new Order({
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: '100',
          bidAmount: '50'
        });
      }).to["throw"]('Order must have an ID');
    });
    it('should throw an error if the timestamp is missing', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: '100',
          bidAmount: '50'
        });
      }).to["throw"]('Order must have a time stamp');
    });
    it('should throw an error if the account name is missing', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: '100',
          bidAmount: '50'
        });
      }).to["throw"]('Order must be associated with an account');
    });
    it('should throw an error if the bid currency is missing', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          offerCurrency: 'EUR',
          bidPrice: '100',
          bidAmount: '50'
        });
      }).to["throw"]('Order must be associated with a bid currency');
    });
    it('should throw an error if the offer currency is missing', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          bidPrice: '100',
          bidAmount: '50'
        });
      }).to["throw"]('Order must be associated with an offer currency');
    });
    it('should throw an error if only a bid price is given as it is not enough information to calculate the other fields a bid', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: '100'
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if only an offer price is given as it is not enough information to calculate the other fields a bid', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '100'
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if only a bid amount is given as it is not enough information to calculate the other fields a bid', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidAmount: '100'
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if only a offer amount is given as it is not enough information to calculate the other fields a bid', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerAmount: '100'
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if both the bid price and offer price are given as we do not want to trust the calculations of others', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: '100',
          offerPrice: '50',
          bidAmount: '50'
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if the bid price, offer amount and bid amount are given as we do not want to trust the calculations of others', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: '100',
          offerAmount: '60',
          bidAmount: '50'
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if the offer price, offer amount and bid amount are given as we do not want to trust the calculations of others', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '100',
          offerAmount: '60',
          bidAmount: '50'
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if only amounts are specified as we need to know which amount to satisfy if the order is excuted at a better price', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidAmount: '100',
          offerAmount: '50'
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if a bid amount and offer price are specified as we need to know which amount to satisfy if the order is excuted at a better price', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidAmount: '100',
          offerPrice: '50'
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if an offer amount and bid price are specified as we need to know which amount to satisfy if the order is excuted at a better price', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerAmount: '100',
          bidPrice: '50'
        });
      }).to["throw"]('Must specify either bid amount and price or offer amount and price');
    });
    it('should throw an error if the bid amount is negative', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: '100',
          bidAmount: '-50'
        });
      }).to["throw"]('bid amount cannot be negative');
    });
    it('should throw an error if the bid price is negative', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: '-100',
          bidAmount: '50'
        });
      }).to["throw"]('bid price cannot be negative');
    });
    it('should throw an error if the offer amount is negative', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '100',
          offerAmount: '-50'
        });
      }).to["throw"]('offer amount cannot be negative');
    });
    it('should throw an error if the offer price is negative', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '-100',
          offerAmount: '50'
        });
      }).to["throw"]('offer price cannot be negative');
    });
    it('should record the id, timestamp, account name, bid currency and offer currency', function() {
      var order;

      order = new Order({
        id: '123456789',
        timestamp: '987654321',
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: '100',
        bidAmount: '50'
      });
      order.id.should.equal('123456789');
      order.timestamp.should.equal('987654321');
      order.account.should.equal('name');
      order.bidCurrency.should.equal('BTC');
      return order.offerCurrency.should.equal('EUR');
    });
    it('should instantiate with a bid price and bid amount calculating the offer amount and the offer price and set the type to BID', function() {
      var order;

      order = new Order({
        id: '123456789',
        timestamp: '987654321',
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: '100',
        bidAmount: '50'
      });
      order.bidPrice.compareTo(new Amount('100')).should.equal(0);
      order.offerPrice.compareTo(new Amount('0.01')).should.equal(0);
      order.bidAmount.compareTo(new Amount('50')).should.equal(0);
      order.offerAmount.compareTo(new Amount('5000')).should.equal(0);
      return order.type.should.equal(Order.BID);
    });
    it('should instantiate with an offer price and offer amount calculating the bid amount and the bid price and set type to OFFER', function() {
      var order;

      order = new Order({
        id: '123456789',
        timestamp: '987654321',
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        offerPrice: '100',
        offerAmount: '50'
      });
      order.bidPrice.compareTo(new Amount('0.01')).should.equal(0);
      order.offerPrice.compareTo(new Amount('100')).should.equal(0);
      order.bidAmount.compareTo(new Amount('5000')).should.equal(0);
      order.offerAmount.compareTo(new Amount('50')).should.equal(0);
      return order.type.should.equal(Order.OFFER);
    });
    describe('#equals', function() {
      it('should return true if the orders are identical', function() {
        var order1, order2;

        order1 = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: '100',
          bidAmount: '50'
        });
        order2 = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: '100',
          bidAmount: '50'
        });
        return order1.equals(order2).should.be["true"];
      });
      it('should return false if the orders have different IDs', function() {
        var order1, order2;

        order1 = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: '100',
          bidAmount: '50'
        });
        order2 = new Order({
          id: '123456790',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: '100',
          bidAmount: '50'
        });
        return order1.equals(order2).should.be["false"];
      });
      it('should return false if the orders have different timestamps', function() {
        var order1, order2;

        order1 = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: '100',
          bidAmount: '50'
        });
        order2 = new Order({
          id: '123456789',
          timestamp: '987654322',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: '100',
          bidAmount: '50'
        });
        return order1.equals(order2).should.be["false"];
      });
      it('should return false if the orders have different accounts', function() {
        var order1, order2;

        order1 = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: '100',
          bidAmount: '50'
        });
        order2 = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'another name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: '100',
          bidAmount: '50'
        });
        return order1.equals(order2).should.be["false"];
      });
      it('should return false if the orders have different bid currencies', function() {
        var order1, order2;

        order1 = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: '100',
          bidAmount: '50'
        });
        order2 = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'USD',
          offerCurrency: 'EUR',
          bidPrice: '100',
          bidAmount: '50'
        });
        return order1.equals(order2).should.be["false"];
      });
      it('should return false if the orders have different offer currencies', function() {
        var order1, order2;

        order1 = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: '100',
          bidAmount: '50'
        });
        order2 = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'USD',
          bidPrice: '100',
          bidAmount: '50'
        });
        return order1.equals(order2).should.be["false"];
      });
      it('should return false if the orders have different prices', function() {
        var order1, order2;

        order1 = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: '100',
          bidAmount: '50'
        });
        order2 = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: '150',
          bidAmount: '50'
        });
        return order1.equals(order2).should.be["false"];
      });
      return it('should return false if the orders have different amounts', function() {
        var order1, order2;

        order1 = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: '100',
          bidAmount: '50'
        });
        order2 = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: '100',
          bidAmount: '100'
        });
        return order1.equals(order2).should.be["false"];
      });
    });
    describe('#reduceOffer', function() {
      it('should create a copy of the order with the reduced offer amount', function() {
        var order;

        order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '100',
          offerAmount: '100'
        });
        order.reduceOffer(new Amount('25'));
        order.offerAmount.compareTo(new Amount('75')).should.equal(0);
        return order.bidAmount.compareTo(new Amount('7500')).should.equal(0);
      });
      return it('should throw an error if the order is reduced to zero or below', function() {
        var order;

        order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '100',
          offerAmount: '100'
        });
        return expect(function() {
          return order.reduceOffer(new Amount('101'));
        }).to["throw"]('offer amount cannot be negative');
      });
    });
    describe('#reduceBid', function() {
      it('should create a copy of the order with the reduced bid amount', function() {
        var order;

        order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: '100',
          bidAmount: '100'
        });
        order.reduceBid(new Amount('25'));
        order.bidAmount.compareTo(new Amount('75')).should.equal(0);
        return order.offerAmount.compareTo(new Amount('7500')).should.equal(0);
      });
      return it('should throw an error if the order is reduced below zero', function() {
        var order;

        order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: '100',
          bidAmount: '100'
        });
        return expect(function() {
          return order.reduceBid(new Amount('101'));
        }).to["throw"]('bid amount cannot be negative');
      });
    });
    return describe('#export', function() {
      return it('should export the state of the order as a JSON stringifiable object that can be used to initialise a new order in the exact same state', function() {
        var json, newOrder, order, state;

        order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: '100',
          bidAmount: '100'
        });
        state = order["export"]();
        json = JSON.stringify(state);
        newOrder = new Order({
          state: JSON.parse(json)
        });
        return newOrder.equals(order).should.be["true"];
      });
    });
  });

}).call(this);
