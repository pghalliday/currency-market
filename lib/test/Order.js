(function() {
  var Amount, Order, amount1, amount100, amount1000, amount101, amount125, amount150, amount1500, amount2, amount200, amount25, amount3, amount300, amount4, amount400, amount5, amount50, amount500, amount5000, amount6, amount60, amount7, amount75, amount7500, amount8, amountMinus100, amountMinus50, amountPoint01, amountPoint2, amountPoint25, amountPoint5, assert, chai, expect, newBidOrder, newOfferOrder, sinon, sinonChai;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  assert = chai.assert;

  sinon = require('sinon');

  sinonChai = require('sinon-chai');

  chai.use(sinonChai);

  Order = require('../src/Order');

  Amount = require('../src/Amount');

  amountPoint01 = new Amount('0.01');

  amountPoint2 = new Amount('0.2');

  amountPoint25 = new Amount('0.25');

  amountPoint5 = new Amount('0.5');

  amount1 = new Amount('1');

  amount2 = new Amount('2');

  amount3 = new Amount('3');

  amount4 = new Amount('4');

  amount5 = new Amount('5');

  amount6 = new Amount('6');

  amount7 = new Amount('7');

  amount8 = new Amount('8');

  amount25 = new Amount('25');

  amount50 = new Amount('50');

  amount75 = new Amount('75');

  amount60 = new Amount('60');

  amount100 = new Amount('100');

  amount101 = new Amount('101');

  amount125 = new Amount('125');

  amount150 = new Amount('150');

  amount200 = new Amount('200');

  amount300 = new Amount('300');

  amount400 = new Amount('400');

  amount500 = new Amount('500');

  amount1000 = new Amount('1000');

  amount1500 = new Amount('1500');

  amount5000 = new Amount('5000');

  amount7500 = new Amount('7500');

  amountMinus50 = new Amount('-50');

  amountMinus100 = new Amount('-100');

  newBidOrder = function(bidPrice, id) {
    return new Order({
      id: id || '1',
      timestamp: '1',
      account: 'Peter',
      bidCurrency: 'EUR',
      offerCurrency: 'BTC',
      bidPrice: bidPrice,
      bidAmount: amount200
    });
  };

  newOfferOrder = function(offerPrice, id) {
    return new Order({
      id: id || '1',
      timestamp: '1',
      account: 'Peter',
      bidCurrency: 'EUR',
      offerCurrency: 'BTC',
      offerPrice: offerPrice,
      offerAmount: amount200
    });
  };

  describe('Order', function() {
    it('should throw an error if the ID is missing', function() {
      return expect(function() {
        var order;

        return order = new Order({
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: amount100,
          bidAmount: amount50
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
          bidPrice: amount100,
          bidAmount: amount50
        });
      }).to["throw"]('Order must have a time stamp');
    });
    it('should throw an error if the account id is missing', function() {
      return expect(function() {
        var order;

        return order = new Order({
          id: '123456789',
          timestamp: '987654321',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: amount100,
          bidAmount: amount50
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
          bidPrice: amount100,
          bidAmount: amount50
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
          bidPrice: amount100,
          bidAmount: amount50
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
          bidPrice: amount100
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
          offerPrice: amount100
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
          bidAmount: amount100
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
          offerAmount: amount100
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
          bidPrice: amount100,
          offerPrice: amount50,
          bidAmount: amount50
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
          bidPrice: amount100,
          offerAmount: amount60,
          bidAmount: amount50
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
          offerPrice: amount100,
          offerAmount: amount60,
          bidAmount: amount50
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
          bidAmount: amount100,
          offerAmount: amount50
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
          bidAmount: amount100,
          offerPrice: amount50
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
          offerAmount: amount100,
          bidPrice: amount50
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
          bidPrice: amount100,
          bidAmount: amountMinus50
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
          bidPrice: amountMinus100,
          bidAmount: amount50
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
          offerPrice: amount100,
          offerAmount: amountMinus50
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
          offerPrice: amountMinus100,
          offerAmount: amount50
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
        bidPrice: amount100,
        bidAmount: amount50
      });
      order.id.should.equal('123456789');
      order.timestamp.should.equal('987654321');
      order.account.should.equal('name');
      order.bidCurrency.should.equal('BTC');
      return order.offerCurrency.should.equal('EUR');
    });
    it('should instantiate with an undefined parent, lower and higher orders, bid price and bid amount calculating the offer amount', function() {
      var order;

      order = new Order({
        id: '123456789',
        timestamp: '987654321',
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: amount100,
        bidAmount: amount50
      });
      order.bidPrice.compareTo(amount100).should.equal(0);
      order.bidAmount.compareTo(amount50).should.equal(0);
      order.offerAmount.compareTo(amount5000).should.equal(0);
      expect(order.parent).to.not.be.ok;
      expect(order.lower).to.not.be.ok;
      return expect(order.higher).to.not.be.ok;
    });
    it('should instantiate with an undefined parent, lower and higher orders, offer price and offer amount calculating the bid amount', function() {
      var order;

      order = new Order({
        id: '123456789',
        timestamp: '987654321',
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        offerPrice: amount100,
        offerAmount: amount50
      });
      order.offerPrice.compareTo(amount100).should.equal(0);
      order.bidAmount.compareTo(amount5000).should.equal(0);
      order.offerAmount.compareTo(amount50).should.equal(0);
      expect(order.parent).to.not.be.ok;
      expect(order.lower).to.not.be.ok;
      return expect(order.higher).to.not.be.ok;
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
          bidPrice: amount100,
          bidAmount: amount50
        });
        order2 = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: amount100,
          bidAmount: amount50
        });
        return order1.equals(order2).should.be["true"];
      });
      describe('with trees of orders', function() {
        beforeEach(function() {
          this.bidOrder1a = newBidOrder(amount1);
          this.bidOrder1b = newBidOrder(amount1);
          this.bidOrder2a = newBidOrder(amount2);
          this.bidOrder2b = newBidOrder(amount2);
          this.bidOrder3a = newBidOrder(amount3);
          this.bidOrder3b = newBidOrder(amount3);
          this.bidOrder4a = newBidOrder(amount4);
          this.bidOrder4b = newBidOrder(amount4);
          this.bidOrder5a = newBidOrder(amount5);
          this.bidOrder5b = newBidOrder(amount5);
          this.bidOrder6a = newBidOrder(amount6);
          this.bidOrder6b = newBidOrder(amount6);
          this.bidOrder7a = newBidOrder(amount7);
          this.bidOrder7b = newBidOrder(amount7);
          this.bidOrder8a = newBidOrder(amount8);
          return this.bidOrder8b = newBidOrder(amount8);
        });
        it('should return true if 2 trees are the same', function() {
          this.bidOrder4a.equals(this.bidOrder4b).should.be["true"];
          this.bidOrder4a.add(this.bidOrder5a);
          this.bidOrder4b.add(this.bidOrder5b);
          this.bidOrder4a.equals(this.bidOrder4b).should.be["true"];
          this.bidOrder4a.add(this.bidOrder3a);
          this.bidOrder4b.add(this.bidOrder3b);
          this.bidOrder4a.equals(this.bidOrder4b).should.be["true"];
          this.bidOrder4a.add(this.bidOrder2a);
          this.bidOrder4b.add(this.bidOrder2b);
          this.bidOrder4a.equals(this.bidOrder4b).should.be["true"];
          this.bidOrder4a.add(this.bidOrder1a);
          this.bidOrder4b.add(this.bidOrder1b);
          this.bidOrder4a.equals(this.bidOrder4b).should.be["true"];
          this.bidOrder4a.add(this.bidOrder8a);
          this.bidOrder4b.add(this.bidOrder8b);
          this.bidOrder4a.equals(this.bidOrder4b).should.be["true"];
          this.bidOrder4a.add(this.bidOrder6a);
          this.bidOrder4b.add(this.bidOrder6b);
          this.bidOrder4a.equals(this.bidOrder4b).should.be["true"];
          this.bidOrder4a.add(this.bidOrder7a);
          this.bidOrder4b.add(this.bidOrder7b);
          return this.bidOrder4a.equals(this.bidOrder4b).should.be["true"];
        });
        return it('should return false if the trees are different', function() {
          this.bidOrder4a.equals(this.bidOrder5b).should.be["false"];
          this.bidOrder4a.add(this.bidOrder5a);
          this.bidOrder4a.equals(this.bidOrder4b).should.be["false"];
          this.bidOrder4b.equals(this.bidOrder4a).should.be["false"];
          this.bidOrder4b.add(this.bidOrder6b);
          this.bidOrder4a.equals(this.bidOrder4b).should.be["false"];
          this.bidOrder4b.equals(this.bidOrder4a).should.be["false"];
          this.bidOrder3a.add(this.bidOrder2a);
          this.bidOrder3a.equals(this.bidOrder3b).should.be["false"];
          this.bidOrder3b.equals(this.bidOrder3a).should.be["false"];
          this.bidOrder3b.add(this.bidOrder1b);
          this.bidOrder3a.equals(this.bidOrder3b).should.be["false"];
          return this.bidOrder3b.equals(this.bidOrder3a).should.be["false"];
        });
      });
      it('should return false if the orders have different IDs', function() {
        var order1, order2;

        order1 = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: amount100,
          bidAmount: amount50
        });
        order2 = new Order({
          id: '123456790',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: amount100,
          bidAmount: amount50
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
          bidPrice: amount100,
          bidAmount: amount50
        });
        order2 = new Order({
          id: '123456789',
          timestamp: '987654322',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: amount100,
          bidAmount: amount50
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
          bidPrice: amount100,
          bidAmount: amount50
        });
        order2 = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'another name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: amount100,
          bidAmount: amount50
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
          bidPrice: amount100,
          bidAmount: amount50
        });
        order2 = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'USD',
          offerCurrency: 'EUR',
          bidPrice: amount100,
          bidAmount: amount50
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
          bidPrice: amount100,
          bidAmount: amount50
        });
        order2 = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'USD',
          bidPrice: amount100,
          bidAmount: amount50
        });
        return order1.equals(order2).should.be["false"];
      });
      describe('with bid orders', function() {
        it('should return false if the orders have different prices', function() {
          var order1, order2;

          order1 = new Order({
            id: '123456789',
            timestamp: '987654321',
            account: 'name',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            bidPrice: amount100,
            bidAmount: amount50
          });
          order2 = new Order({
            id: '123456789',
            timestamp: '987654321',
            account: 'name',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            bidPrice: amount150,
            bidAmount: amount50
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
            bidPrice: amount100,
            bidAmount: amount50
          });
          order2 = new Order({
            id: '123456789',
            timestamp: '987654321',
            account: 'name',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            bidPrice: amount100,
            bidAmount: amount100
          });
          return order1.equals(order2).should.be["false"];
        });
      });
      return describe('with offer orders', function() {
        it('should return false if the orders have different prices', function() {
          var order1, order2;

          order1 = new Order({
            id: '123456789',
            timestamp: '987654321',
            account: 'name',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: amount100,
            offerAmount: amount50
          });
          order2 = new Order({
            id: '123456789',
            timestamp: '987654321',
            account: 'name',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: amount150,
            offerAmount: amount50
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
            offerPrice: amount100,
            offerAmount: amount50
          });
          order2 = new Order({
            id: '123456789',
            timestamp: '987654321',
            account: 'name',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: amount100,
            offerAmount: amount100
          });
          return order1.equals(order2).should.be["false"];
        });
      });
    });
    it('should return false if the orders are different types', function() {
      var order1, order2;

      order1 = new Order({
        id: '123456789',
        timestamp: '987654321',
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        offerPrice: amount100,
        offerAmount: amount50
      });
      order2 = new Order({
        id: '123456789',
        timestamp: '987654321',
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: amount100,
        bidAmount: amount100
      });
      return order1.equals(order2).should.be["false"];
    });
    describe('#match', function() {
      describe('where the existing (right) order is an offer', function() {
        beforeEach(function() {
          this.order = new Order({
            id: '1',
            timestamp: '1',
            account: 'Peter',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: amountPoint2,
            offerAmount: amount1000
          });
          this.doneSpy = sinon.spy();
          this.order.on('done', this.doneSpy);
          this.fillSpy = sinon.spy();
          this.order.on('fill', this.fillSpy);
          this.tradeSpy = sinon.spy();
          return this.order.on('trade', this.tradeSpy);
        });
        describe('and the new (left) price is same', function() {
          describe('and the left order is a bid', function() {
            describe('and the right order is offering exactly the amount the left order is bidding', function() {
              return it('should trade the amount the right order is offering, emit fill events and a trade event and return false to indicate that no higher trades can be filled by the left order', function() {
                var doneSpy, fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  bidPrice: amountPoint2,
                  bidAmount: amount1000
                });
                doneSpy = sinon.spy();
                order.on('done', doneSpy);
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["false"];
                doneSpy.should.have.been.calledOnce;
                this.doneSpy.should.have.been.calledOnce;
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
              });
            });
            describe('and the right order is offering more than the left order is bidding', function() {
              return it('should trade the amount the left order is offering, emit fill events and a trade event and return false to indicate that higher trades may still be filled by the left order', function() {
                var doneSpy, fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  bidPrice: amountPoint2,
                  bidAmount: amount500
                });
                doneSpy = sinon.spy();
                order.on('done', doneSpy);
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["false"];
                doneSpy.should.have.been.calledOnce;
                this.doneSpy.should.not.have.been.called;
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount100).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount500).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount100).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount500).should.equal(0);
                this.order.bidAmount.compareTo(amount100).should.equal(0);
                this.order.offerAmount.compareTo(amount500).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount500).should.equal(0);
              });
            });
            return describe('and the right order is offering less than the left order is bidding', function() {
              return it('should trade the amount the right order is offering, emit fill events and a trade event and return true', function() {
                var doneSpy, fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  bidPrice: amountPoint2,
                  bidAmount: amount1500
                });
                doneSpy = sinon.spy();
                order.on('done', doneSpy);
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["true"];
                doneSpy.should.not.have.been.called;
                this.doneSpy.should.have.been.calledOnce;
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                order.offerAmount.compareTo(amount100).should.equal(0);
                order.bidAmount.compareTo(amount500).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
              });
            });
          });
          return describe('and the left order is an offer', function() {
            describe('and the right order is offering exactly the amount the left order is offering', function() {
              return it('should trade the amount the right order is offering, emit a fill events and a trade event and return false', function() {
                var doneSpy, fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  offerPrice: amount5,
                  offerAmount: amount200
                });
                doneSpy = sinon.spy();
                order.on('done', doneSpy);
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["false"];
                doneSpy.should.have.been.calledOnce;
                this.doneSpy.should.have.been.calledOnce;
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
              });
            });
            describe('and the right order is offering more than the left order is offering', function() {
              return it('should trade the amount the left order is offering, emit a fill events and a trade event and return false', function() {
                var doneSpy, fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  offerPrice: amount5,
                  offerAmount: amount100
                });
                doneSpy = sinon.spy();
                order.on('done', doneSpy);
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["false"];
                doneSpy.should.have.been.calledOnce;
                this.doneSpy.should.not.have.been.called;
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount100).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount500).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount100).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount500).should.equal(0);
                this.order.bidAmount.compareTo(amount100).should.equal(0);
                this.order.offerAmount.compareTo(amount500).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount500).should.equal(0);
              });
            });
            return describe('and the right order is offering less than the left order is offering', function() {
              return it('should trade the amount the right order is offering, emit fill events and a trade event and return true', function() {
                var doneSpy, fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  offerPrice: amount5,
                  offerAmount: amount300
                });
                doneSpy = sinon.spy();
                order.on('done', doneSpy);
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["true"];
                doneSpy.should.not.have.been.called;
                this.doneSpy.should.have.been.calledOnce;
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                order.offerAmount.compareTo(amount100).should.equal(0);
                order.bidAmount.compareTo(amount500).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
              });
            });
          });
        });
        return describe('and the new (left) price is the better', function() {
          describe('and the left order is an offer', function() {
            describe('and the right order is offering exactly the amount that the left order is offering multiplied by the right order price', function() {
              return it('should trade the amount the right order is offering at the right order price, emit fill events and a trade event and return false', function() {
                var doneSpy, fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  offerPrice: amount4,
                  offerAmount: amount200
                });
                doneSpy = sinon.spy();
                order.on('done', doneSpy);
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["false"];
                doneSpy.should.have.been.calledOnce;
                this.doneSpy.should.have.been.calledOnce;
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
              });
            });
            describe('and the right order is offering more than the left order is offering multiplied by the right order price', function() {
              return it('should trade the amount the left order is offering at the right order price, emit fill events and a trade event and return false', function() {
                var doneSpy, fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  offerPrice: amount4,
                  offerAmount: amount100
                });
                doneSpy = sinon.spy();
                order.on('done', doneSpy);
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["false"];
                doneSpy.should.have.been.calledOnce;
                this.doneSpy.should.not.have.been.called;
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount100).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount500).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount100).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount500).should.equal(0);
                this.order.bidAmount.compareTo(amount100).should.equal(0);
                this.order.offerAmount.compareTo(amount500).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount500).should.equal(0);
              });
            });
            return describe('and the right order is offering less than the left order is offering multiplied by the right order price', function() {
              return it('should trade the amount the right order is offering at the right order price, emit fill events and a trade event and return true', function() {
                var doneSpy, fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  offerPrice: amount4,
                  offerAmount: amount300
                });
                doneSpy = sinon.spy();
                order.on('done', doneSpy);
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["true"];
                doneSpy.should.not.have.been.called;
                this.doneSpy.should.have.been.calledOnce;
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                order.offerAmount.compareTo(amount100).should.equal(0);
                order.bidAmount.compareTo(amount400).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
              });
            });
          });
          return describe('and the left order is a bid', function() {
            describe('and the right order is offering exactly the amount that the left order is bidding', function() {
              return it('should trade the amount the right order is offering at the right order price, emit fill events and a trade event and retrun false', function() {
                var doneSpy, fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  bidPrice: amountPoint25,
                  bidAmount: amount1000
                });
                doneSpy = sinon.spy();
                order.on('done', doneSpy);
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["false"];
                doneSpy.should.have.been.calledOnce;
                this.doneSpy.should.have.been.calledOnce;
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
              });
            });
            describe('and the right order is offering more than the left order is bidding', function() {
              return it('should trade the amount the left order is bidding at the right order price, emit fill events and a trade event and return false', function() {
                var doneSpy, fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  bidPrice: amountPoint25,
                  bidAmount: amount500
                });
                doneSpy = sinon.spy();
                order.on('done', doneSpy);
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["false"];
                doneSpy.should.have.been.calledOnce;
                this.doneSpy.should.not.have.been.called;
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount100).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount500).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount100).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount500).should.equal(0);
                this.order.bidAmount.compareTo(amount100).should.equal(0);
                this.order.offerAmount.compareTo(amount500).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount500).should.equal(0);
              });
            });
            return describe('and the right order is offering less than the left order is bidding', function() {
              return it('should trade the amount the right order is offering at the right order price, emit fill events and a trade event and return true', function() {
                var doneSpy, fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  bidPrice: amountPoint25,
                  bidAmount: amount1500
                });
                doneSpy = sinon.spy();
                order.on('done', doneSpy);
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["true"];
                doneSpy.should.not.have.been.called;
                this.doneSpy.should.have.been.calledOnce;
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                order.offerAmount.compareTo(amount125).should.equal(0);
                order.bidAmount.compareTo(amount500).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
              });
            });
          });
        });
      });
      return describe('where the existing (right) order is a bid', function() {
        beforeEach(function() {
          this.order = new Order({
            id: '1',
            timestamp: '1',
            account: 'Peter',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            bidPrice: amount5,
            bidAmount: amount200
          });
          this.doneSpy = sinon.spy();
          this.order.on('done', this.doneSpy);
          this.fillSpy = sinon.spy();
          this.order.on('fill', this.fillSpy);
          this.tradeSpy = sinon.spy();
          return this.order.on('trade', this.tradeSpy);
        });
        return describe('and the new (left) price is better', function() {
          describe('and the left order is an offer', function() {
            describe('and the right order is bidding exactly the amount that the left order is offering', function() {
              return it('should trade the amount the right order is bidding at the right order price, emit fill events and a trade event and return false', function() {
                var doneSpy, fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  offerPrice: amount4,
                  offerAmount: amount200
                });
                doneSpy = sinon.spy();
                order.on('done', doneSpy);
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["false"];
                doneSpy.should.have.been.calledOnce;
                this.doneSpy.should.have.been.calledOnce;
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount200).should.equal(0);
              });
            });
            describe('and the right order is bidding more than the left order is offering', function() {
              return it('should trade the amount the left order is offering at the right order price, emit fill events and a trade event and return false', function() {
                var doneSpy, fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  offerPrice: amount4,
                  offerAmount: amount100
                });
                doneSpy = sinon.spy();
                order.on('done', doneSpy);
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["false"];
                doneSpy.should.have.been.calledOnce;
                this.doneSpy.should.not.have.been.called;
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount100).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount500).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount100).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount500).should.equal(0);
                this.order.bidAmount.compareTo(amount100).should.equal(0);
                this.order.offerAmount.compareTo(amount500).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount100).should.equal(0);
              });
            });
            return describe('and the right order is bidding less than the left order is offering', function() {
              return it('should trade the amount the right order is bidding at the right order price, emit fill events and a trade event and return true', function() {
                var doneSpy, fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  offerPrice: amount4,
                  offerAmount: amount300
                });
                doneSpy = sinon.spy();
                order.on('done', doneSpy);
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["true"];
                doneSpy.should.not.have.been.called;
                this.doneSpy.should.have.been.calledOnce;
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                order.offerAmount.compareTo(amount100).should.equal(0);
                order.bidAmount.compareTo(amount400).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount200).should.equal(0);
              });
            });
          });
          return describe('and the left order is a bid', function() {
            describe('and the right order is bidding exactly the amount that the left order is bidding multiplied by the right order price', function() {
              return it('should trade the amount the right order is bidding at the right order price, emit fill events and a trade event and return false', function() {
                var doneSpy, fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  bidPrice: amountPoint25,
                  bidAmount: amount1000
                });
                doneSpy = sinon.spy();
                order.on('done', doneSpy);
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["false"];
                doneSpy.should.have.been.calledOnce;
                this.doneSpy.should.have.been.calledOnce;
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount200).should.equal(0);
              });
            });
            describe('and the right order is bidding more than the left order is bidding multiplied by the right order price', function() {
              return it('should trade the amount the left order is bidding at the right order price, emit fill events and a trade event and return false', function() {
                var doneSpy, fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  bidPrice: amountPoint25,
                  bidAmount: amount500
                });
                doneSpy = sinon.spy();
                order.on('done', doneSpy);
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["false"];
                doneSpy.should.have.been.calledOnce;
                this.doneSpy.should.not.have.been.called;
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount100).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount500).should.equal(0);
                order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount100).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount500).should.equal(0);
                this.order.bidAmount.compareTo(amount100).should.equal(0);
                this.order.offerAmount.compareTo(amount500).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount100).should.equal(0);
              });
            });
            return describe('and the right order is bidding less than the left order is bidding multiplied by the right order price', function() {
              return it('should trade the amount the right order is bidding at the right order price, emit fill events and a trade event and return true', function() {
                var doneSpy, fillSpy, order, tradeSpy;

                order = new Order({
                  id: '2',
                  timestamp: '2',
                  account: 'Paul',
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  bidPrice: amountPoint25,
                  bidAmount: amount1500
                });
                doneSpy = sinon.spy();
                order.on('done', doneSpy);
                fillSpy = sinon.spy();
                order.on('fill', fillSpy);
                tradeSpy = sinon.spy();
                order.on('trade', tradeSpy);
                order.match(this.order).should.be["true"];
                doneSpy.should.not.have.been.called;
                this.doneSpy.should.have.been.calledOnce;
                fillSpy.should.have.been.calledOnce;
                fillSpy.firstCall.args[0].offerAmount.compareTo(amount200).should.equal(0);
                fillSpy.firstCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                order.offerAmount.compareTo(amount125).should.equal(0);
                order.bidAmount.compareTo(amount500).should.equal(0);
                this.fillSpy.should.have.been.calledOnce;
                this.fillSpy.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                this.fillSpy.firstCall.args[0].offerAmount.compareTo(amount1000).should.equal(0);
                this.order.bidAmount.compareTo(Amount.ZERO).should.equal(0);
                this.order.offerAmount.compareTo(Amount.ZERO).should.equal(0);
                tradeSpy.should.not.have.been.called;
                this.tradeSpy.should.have.been.calledOnce;
                this.tradeSpy.firstCall.args[0].bid.should.equal(this.order);
                this.tradeSpy.firstCall.args[0].offer.should.equal(order);
                this.tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal(0);
                return this.tradeSpy.firstCall.args[0].amount.compareTo(amount200).should.equal(0);
              });
            });
          });
        });
      });
    });
    describe('#add', function() {
      beforeEach(function() {
        this.bidOrder = newBidOrder(amountPoint2);
        this.higherBidOrder = newBidOrder(amount1);
        this.evenHigherBidOrder = newBidOrder(amount2);
        this.equalBidOrder = newBidOrder(amountPoint2);
        this.secondEqualBidOrder = newBidOrder(amountPoint2);
        this.offerOrder = newOfferOrder(amount5);
        this.higherOfferOrder = newOfferOrder(amount1);
        this.evenHigherOfferOrder = newOfferOrder(amountPoint5);
        this.equalOfferOrder = newOfferOrder(amount5);
        return this.secondEqualOfferOrder = newOfferOrder(amount5);
      });
      describe('only bids', function() {
        describe('on a book entry with no lower or higher orders', function() {
          describe('an entry with a higher bid price', function() {
            return it('should set the higher entry to the Order being added and set the parent on the added Order', function() {
              this.bidOrder.add(this.higherBidOrder);
              expect(this.bidOrder.parent).to.not.be.ok;
              expect(this.bidOrder.lower).to.not.be.ok;
              this.bidOrder.higher.should.equal(this.higherBidOrder);
              this.higherBidOrder.parent.should.equal(this.bidOrder);
              expect(this.higherBidOrder.lower).to.not.be.ok;
              return expect(this.higherBidOrder.higher).to.not.be.ok;
            });
          });
          return describe('an entry with the same or lower bid price', function() {
            return it('should set the lower entry to the Order being added and set the parent on the added Order', function() {
              this.bidOrder.add(this.equalBidOrder);
              expect(this.bidOrder.parent).to.not.be.ok;
              this.bidOrder.lower.should.equal(this.equalBidOrder);
              expect(this.bidOrder.higher).to.not.be.ok;
              this.equalBidOrder.parent.should.equal(this.bidOrder);
              expect(this.equalBidOrder.lower).to.not.be.ok;
              return expect(this.equalBidOrder.higher).to.not.be.ok;
            });
          });
        });
        return describe('on a book entry with both higher and lower orders', function() {
          beforeEach(function() {
            this.bidOrder.add(this.equalBidOrder);
            this.bidOrder.add(this.higherBidOrder);
            this.lowerAddSpy = sinon.spy();
            this.higherAddSpy = sinon.spy();
            this.equalBidOrder.add = this.lowerAddSpy;
            return this.higherBidOrder.add = this.higherAddSpy;
          });
          describe('an entry with a higher bid price', function() {
            return it('should call the add method of the higher Order', function() {
              this.bidOrder.add(this.evenHigherBidOrder);
              this.lowerAddSpy.should.not.have.been.called;
              return this.higherAddSpy.should.have.been.calledWith(this.evenHigherBidOrder);
            });
          });
          return describe('an entry with the same or lower bid price', function() {
            return it('should call the add method of the lower Order', function() {
              this.bidOrder.add(this.secondEqualBidOrder);
              this.lowerAddSpy.should.have.been.calledWith(this.secondEqualBidOrder);
              return this.higherAddSpy.should.not.have.been.called;
            });
          });
        });
      });
      describe('only offers', function() {
        describe('on a book entry with no lower or higher orders', function() {
          describe('an entry with a higher bid price', function() {
            return it('should set the higher entry to the Order being added and set the parent on the added Order', function() {
              this.offerOrder.add(this.higherOfferOrder);
              expect(this.offerOrder.parent).to.not.be.ok;
              expect(this.offerOrder.lower).to.not.be.ok;
              this.offerOrder.higher.should.equal(this.higherOfferOrder);
              this.higherOfferOrder.parent.should.equal(this.offerOrder);
              expect(this.higherOfferOrder.lower).to.not.be.ok;
              return expect(this.higherOfferOrder.higher).to.not.be.ok;
            });
          });
          return describe('an entry with the same or lower bid price', function() {
            return it('should set the lower entry to the Order being added and set the parent on the added Order', function() {
              this.offerOrder.add(this.equalOfferOrder);
              expect(this.offerOrder.parent).to.not.be.ok;
              this.offerOrder.lower.should.equal(this.equalOfferOrder);
              expect(this.offerOrder.higher).to.not.be.ok;
              this.equalOfferOrder.parent.should.equal(this.offerOrder);
              expect(this.equalOfferOrder.lower).to.not.be.ok;
              return expect(this.equalOfferOrder.higher).to.not.be.ok;
            });
          });
        });
        return describe('on a book entry with both higher and lower orders', function() {
          beforeEach(function() {
            this.offerOrder.add(this.equalOfferOrder);
            this.offerOrder.add(this.higherOfferOrder);
            this.lowerAddSpy = sinon.spy();
            this.higherAddSpy = sinon.spy();
            this.equalOfferOrder.add = this.lowerAddSpy;
            return this.higherOfferOrder.add = this.higherAddSpy;
          });
          describe('an entry with a higher bid price', function() {
            return it('should call the add method of the higher Order', function() {
              this.offerOrder.add(this.evenHigherOfferOrder);
              this.lowerAddSpy.should.not.have.been.called;
              return this.higherAddSpy.should.have.been.calledWith(this.evenHigherOfferOrder);
            });
          });
          return describe('an entry with the same or lower bid price', function() {
            return it('should call the add method of the lower Order', function() {
              this.offerOrder.add(this.secondEqualOfferOrder);
              this.lowerAddSpy.should.have.been.calledWith(this.secondEqualOfferOrder);
              return this.higherAddSpy.should.not.have.been.called;
            });
          });
        });
      });
      describe('an offer to bids', function() {
        describe('on a book entry with no lower or higher orders', function() {
          describe('an entry with a higher bid price', function() {
            return it('should set the higher entry to the Order being added and set the parent on the added Order', function() {
              this.bidOrder.add(this.higherOfferOrder);
              expect(this.bidOrder.parent).to.not.be.ok;
              expect(this.bidOrder.lower).to.not.be.ok;
              this.bidOrder.higher.should.equal(this.higherOfferOrder);
              this.higherOfferOrder.parent.should.equal(this.bidOrder);
              expect(this.higherOfferOrder.lower).to.not.be.ok;
              return expect(this.higherOfferOrder.higher).to.not.be.ok;
            });
          });
          return describe('an entry with the same or lower bid price', function() {
            return it('should set the lower entry to the Order being added and set the parent on the added Order', function() {
              this.bidOrder.add(this.equalOfferOrder);
              expect(this.bidOrder.parent).to.not.be.ok;
              this.bidOrder.lower.should.equal(this.equalOfferOrder);
              expect(this.bidOrder.higher).to.not.be.ok;
              this.equalOfferOrder.parent.should.equal(this.bidOrder);
              expect(this.equalOfferOrder.lower).to.not.be.ok;
              return expect(this.equalOfferOrder.higher).to.not.be.ok;
            });
          });
        });
        return describe('on a book entry with both higher and lower orders', function() {
          beforeEach(function() {
            this.bidOrder.add(this.equalBidOrder);
            this.bidOrder.add(this.higherBidOrder);
            this.lowerAddSpy = sinon.spy();
            this.higherAddSpy = sinon.spy();
            this.equalBidOrder.add = this.lowerAddSpy;
            return this.higherBidOrder.add = this.higherAddSpy;
          });
          describe('an entry with a higher bid price', function() {
            return it('should call the add method of the higher Order', function() {
              this.bidOrder.add(this.evenHigherOfferOrder);
              this.lowerAddSpy.should.not.have.been.called;
              return this.higherAddSpy.should.have.been.calledWith(this.evenHigherOfferOrder);
            });
          });
          return describe('an entry with the same or lower bid price', function() {
            return it('should call the add method of the lower Order', function() {
              this.bidOrder.add(this.secondEqualOfferOrder);
              this.lowerAddSpy.should.have.been.calledWith(this.secondEqualOfferOrder);
              return this.higherAddSpy.should.not.have.been.called;
            });
          });
        });
      });
      return describe('a bid to offers', function() {
        describe('on a book entry with no lower or higher orders', function() {
          describe('an entry with a higher bid price', function() {
            return it('should set the higher entry to the Order being added and set the parent on the added Order', function() {
              this.offerOrder.add(this.higherBidOrder);
              expect(this.offerOrder.parent).to.not.be.ok;
              expect(this.offerOrder.lower).to.not.be.ok;
              this.offerOrder.higher.should.equal(this.higherBidOrder);
              this.higherBidOrder.parent.should.equal(this.offerOrder);
              expect(this.higherBidOrder.lower).to.not.be.ok;
              return expect(this.higherBidOrder.higher).to.not.be.ok;
            });
          });
          return describe('an entry with the same or lower bid price', function() {
            return it('should set the lower entry to the Order being added and set the parent on the added Order', function() {
              this.offerOrder.add(this.equalBidOrder);
              expect(this.offerOrder.parent).to.not.be.ok;
              this.offerOrder.lower.should.equal(this.equalBidOrder);
              expect(this.offerOrder.higher).to.not.be.ok;
              this.equalBidOrder.parent.should.equal(this.offerOrder);
              expect(this.equalBidOrder.lower).to.not.be.ok;
              return expect(this.equalBidOrder.higher).to.not.be.ok;
            });
          });
        });
        return describe('on a book entry with both higher and lower orders', function() {
          beforeEach(function() {
            this.offerOrder.add(this.equalOfferOrder);
            this.offerOrder.add(this.higherOfferOrder);
            this.lowerAddSpy = sinon.spy();
            this.higherAddSpy = sinon.spy();
            this.equalOfferOrder.add = this.lowerAddSpy;
            return this.higherOfferOrder.add = this.higherAddSpy;
          });
          describe('an entry with a higher bid price', function() {
            return it('should call the add method of the higher Order', function() {
              this.offerOrder.add(this.evenHigherBidOrder);
              this.lowerAddSpy.should.not.have.been.called;
              return this.higherAddSpy.should.have.been.calledWith(this.evenHigherBidOrder);
            });
          });
          return describe('an entry with the same or lower bid price', function() {
            return it('should call the add method of the lower Order', function() {
              this.offerOrder.add(this.secondEqualBidOrder);
              this.lowerAddSpy.should.have.been.calledWith(this.secondEqualBidOrder);
              return this.higherAddSpy.should.not.have.been.called;
            });
          });
        });
      });
    });
    describe('#addLowest', function() {
      describe('with no lower Order', function() {
        return it('should set the lower Order to the given Order regardless of the bidPrice', function() {
          var order1, order2;

          order1 = newBidOrder(amount1);
          order2 = newBidOrder(amount2);
          order1.addLowest(order2);
          order1.lower.should.equal(order2);
          return order2.parent.should.equal(order1);
        });
      });
      return describe('with a lower Order', function() {
        return it('should call addLowest with the given Order regardless of the bidPrice', function() {
          var addLowestSpy, order1, order2, order3;

          order1 = newBidOrder(amount1);
          order2 = newBidOrder(amount2);
          order3 = newBidOrder(amount3);
          order2.add(order1);
          addLowestSpy = sinon.spy();
          order1.addLowest = addLowestSpy;
          order2.addLowest(order3);
          return addLowestSpy.should.have.been.calledWith(order3);
        });
      });
    });
    describe('#delete', function() {
      beforeEach(function() {
        this.bidOrder1 = newBidOrder(amount1);
        this.bidOrder2 = newBidOrder(amount2);
        this.bidOrder3 = newBidOrder(amount3);
        this.bidOrder4 = newBidOrder(amount4);
        this.bidOrder5 = newBidOrder(amount5);
        this.bidOrder6 = newBidOrder(amount6);
        this.bidOrder7 = newBidOrder(amount7);
        return this.bidOrder8 = newBidOrder(amount8);
      });
      describe('a Order with a lower parent but no lower or higher', function() {
        return it('should delete the parent higher Order', function() {
          this.bidOrder2.add(this.bidOrder3);
          this.bidOrder2.add(this.bidOrder1);
          this.bidOrder3["delete"]();
          this.bidOrder2.lower.should.equal(this.bidOrder1);
          return expect(this.bidOrder2.higher).to.not.be.ok;
        });
      });
      describe('a Order with a higher parent but no lower or higher', function() {
        return it('should delete the parent lower Order', function() {
          this.bidOrder2.add(this.bidOrder3);
          this.bidOrder2.add(this.bidOrder1);
          this.bidOrder1["delete"]();
          expect(this.bidOrder2.lower).to.not.be.ok;
          return this.bidOrder2.higher.should.equal(this.bidOrder3);
        });
      });
      describe('a Order with a lower parent and a lower but no higher Order', function() {
        return it('should set the parent higher to the lower Order and return the lower Order', function() {
          var order;

          this.bidOrder4.add(this.bidOrder6);
          this.bidOrder4.add(this.bidOrder5);
          this.bidOrder4.add(this.bidOrder3);
          order = this.bidOrder6["delete"]();
          order.should.equal(this.bidOrder5);
          this.bidOrder4.lower.should.equal(this.bidOrder3);
          this.bidOrder5.parent.should.equal(this.bidOrder4);
          return this.bidOrder4.higher.should.equal(this.bidOrder5);
        });
      });
      describe('a Order with a lower parent and a higher but no lower Order', function() {
        return it('should set the parent higher to the higher Order and return the higher Order', function() {
          var order;

          this.bidOrder4.add(this.bidOrder6);
          this.bidOrder4.add(this.bidOrder7);
          this.bidOrder4.add(this.bidOrder3);
          order = this.bidOrder6["delete"]();
          order.should.equal(this.bidOrder7);
          this.bidOrder4.lower.should.equal(this.bidOrder3);
          this.bidOrder7.parent.should.equal(this.bidOrder4);
          return this.bidOrder4.higher.should.equal(this.bidOrder7);
        });
      });
      describe('a Order with a lower parent and both higher and lower BookEntries', function() {
        return it('should set the parent higher to the higher Order, call addLowest on the higher Order with the lower Order and return the higher Order', function() {
          var addLowestSpy, order;

          addLowestSpy = sinon.spy();
          this.bidOrder7.addLowest = addLowestSpy;
          this.bidOrder4.add(this.bidOrder6);
          this.bidOrder4.add(this.bidOrder7);
          this.bidOrder4.add(this.bidOrder5);
          this.bidOrder4.add(this.bidOrder3);
          order = this.bidOrder6["delete"]();
          order.should.equal(this.bidOrder7);
          this.bidOrder4.lower.should.equal(this.bidOrder3);
          this.bidOrder7.parent.should.equal(this.bidOrder4);
          this.bidOrder4.higher.should.equal(this.bidOrder7);
          return addLowestSpy.should.have.been.calledWith(this.bidOrder5);
        });
      });
      describe('a Order with a higher parent and a lower but no higher Order', function() {
        return it('should set the parent lower to the lower Order and return the lower Order', function() {
          var order;

          this.bidOrder4.add(this.bidOrder2);
          this.bidOrder4.add(this.bidOrder1);
          this.bidOrder4.add(this.bidOrder5);
          order = this.bidOrder2["delete"]();
          order.should.equal(this.bidOrder1);
          this.bidOrder4.lower.should.equal(this.bidOrder1);
          this.bidOrder1.parent.should.equal(this.bidOrder4);
          return this.bidOrder4.higher.should.equal(this.bidOrder5);
        });
      });
      describe('a Order with a higher parent and a higher but no lower Order', function() {
        return it('should set the parent lower to the higher Order and return the higher Order', function() {
          var order;

          this.bidOrder4.add(this.bidOrder2);
          this.bidOrder4.add(this.bidOrder3);
          this.bidOrder4.add(this.bidOrder5);
          order = this.bidOrder2["delete"]();
          order.should.equal(this.bidOrder3);
          this.bidOrder4.lower.should.equal(this.bidOrder3);
          this.bidOrder3.parent.should.equal(this.bidOrder4);
          return this.bidOrder4.higher.should.equal(this.bidOrder5);
        });
      });
      describe('a Order with a higher parent and both higher and lower BookEntries', function() {
        return it('should set the parent lower to the higher Order, call addLowest on the higher Order with the lower Order and return the higher Order', function() {
          var addLowestSpy, order;

          addLowestSpy = sinon.spy();
          this.bidOrder3.addLowest = addLowestSpy;
          this.bidOrder4.add(this.bidOrder2);
          this.bidOrder4.add(this.bidOrder3);
          this.bidOrder4.add(this.bidOrder5);
          this.bidOrder4.add(this.bidOrder1);
          order = this.bidOrder2["delete"]();
          order.should.equal(this.bidOrder3);
          this.bidOrder4.lower.should.equal(this.bidOrder3);
          this.bidOrder3.parent.should.equal(this.bidOrder4);
          this.bidOrder4.higher.should.equal(this.bidOrder5);
          return addLowestSpy.should.have.been.calledWith(this.bidOrder1);
        });
      });
      describe('a Order with no parent and a lower but no higher Order', function() {
        return it('should return the lower Order', function() {
          var order;

          this.bidOrder4.add(this.bidOrder2);
          order = this.bidOrder4["delete"]();
          order.should.equal(this.bidOrder2);
          return expect(this.bidOrder2.parent).to.not.be.ok;
        });
      });
      describe('a Order with no parent and a higher but no lower Order', function() {
        return it('should return the higher Order', function() {
          var order;

          this.bidOrder4.add(this.bidOrder6);
          order = this.bidOrder4["delete"]();
          order.should.equal(this.bidOrder6);
          return expect(this.bidOrder6.parent).to.not.be.ok;
        });
      });
      return describe('a Order with no parent and both higher and lower BookEntries', function() {
        return it('should call addLowest on the higher Order with the lower Order and return the higher Order', function() {
          var addLowestSpy, order;

          addLowestSpy = sinon.spy();
          this.bidOrder6.addLowest = addLowestSpy;
          this.bidOrder4.add(this.bidOrder2);
          this.bidOrder4.add(this.bidOrder6);
          order = this.bidOrder4["delete"]();
          order.should.equal(this.bidOrder6);
          expect(this.bidOrder6.parent).to.not.be.ok;
          return addLowestSpy.should.have.been.calledWith(this.bidOrder2);
        });
      });
    });
    describe('#getHighest', function() {
      describe('with no higher Order', function() {
        return it('should return itself', function() {
          var order;

          order = newBidOrder(amount1);
          return order.getHighest().should.equal(order);
        });
      });
      return describe('with a higher Order', function() {
        return it('should call getHighest on the higher entry and return the result', function() {
          var order1, order2;

          order1 = newBidOrder(amount1);
          order2 = newBidOrder(amount2);
          order1.add(order2);
          order2.getHighest = sinon.stub().returns('stub');
          return order1.getHighest().should.equal('stub');
        });
      });
    });
    return describe('#export', function() {
      return it('should export the state of a tree of orders as a JSON stringifiable object that can be used to initialise a new tree of orders in the exact same state and populate a collection of orders keyed by id', function() {
        var json, order, order1, order2, order3, order4, order5, order6, order7, order8, orders, state;

        order1 = newBidOrder(amount1, '1');
        order2 = newBidOrder(amount2, '2');
        order3 = newBidOrder(amount3, '3');
        order4 = newBidOrder(amount4, '4');
        order5 = newBidOrder(amount5, '5');
        order6 = newBidOrder(amount6, '6');
        order7 = newBidOrder(amount7, '7');
        order8 = newBidOrder(amount8, '8');
        order4.add(order2);
        order4.add(order6);
        order4.add(order3);
        order4.add(order1);
        order4.add(order5);
        order4.add(order7);
        order4.add(order8);
        orders = Object.create(null);
        state = order4["export"]();
        json = JSON.stringify(state);
        order = new Order({
          state: JSON.parse(json),
          orders: orders
        });
        orders['1'].equals(order1).should.be["true"];
        orders['2'].equals(order2).should.be["true"];
        orders['3'].equals(order3).should.be["true"];
        orders['4'].equals(order4).should.be["true"];
        orders['5'].equals(order5).should.be["true"];
        orders['6'].equals(order6).should.be["true"];
        orders['7'].equals(order7).should.be["true"];
        orders['8'].equals(order8).should.be["true"];
        return order.equals(order4).should.be["true"];
      });
    });
  });

}).call(this);
