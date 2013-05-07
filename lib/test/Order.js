(function() {
  var Amount, Order, amount1, amount100, amount1000, amount101, amount125, amount150, amount1500, amount2, amount200, amount25, amount3, amount300, amount4, amount400, amount48Point5, amount48Point75, amount49, amount49Point5, amount49Point75, amount5, amount50, amount500, amount5000, amount50Point5, amount50Point75, amount51, amount52, amount53, amount6, amount60, amount7, amount75, amount7500, amount8, amount99, amountMinus100, amountMinus50, amountPoint01, amountPoint2, amountPoint25, amountPoint5, assert, chai, expect, newBidOrder, newOfferOrder, sinon, sinonChai;

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

  amount75 = new Amount('75');

  amount60 = new Amount('60');

  amount99 = new Amount('99');

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
      describe('an Order with a lower parent but no lower or higher', function() {
        return it('should delete the parent higher Order', function() {
          this.bidOrder2.add(this.bidOrder3);
          this.bidOrder2.add(this.bidOrder1);
          this.bidOrder3["delete"]();
          this.bidOrder2.lower.should.equal(this.bidOrder1);
          return expect(this.bidOrder2.higher).to.not.be.ok;
        });
      });
      describe('an Order with a higher parent but no lower or higher', function() {
        return it('should delete the parent lower Order', function() {
          this.bidOrder2.add(this.bidOrder3);
          this.bidOrder2.add(this.bidOrder1);
          this.bidOrder1["delete"]();
          expect(this.bidOrder2.lower).to.not.be.ok;
          return this.bidOrder2.higher.should.equal(this.bidOrder3);
        });
      });
      describe('an Order with a lower parent and a lower but no higher Order', function() {
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
      describe('an Order with a lower parent and a higher but no lower Order', function() {
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
      describe('an Order with a lower parent and both higher and lower BookEntries', function() {
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
      describe('an Order with a higher parent and a lower but no higher Order', function() {
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
      describe('an Order with a higher parent and a higher but no lower Order', function() {
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
      describe('an Order with a higher parent and both higher and lower BookEntries', function() {
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
      describe('an Order with no parent and a lower but no higher Order', function() {
        return it('should return the lower Order', function() {
          var order;

          this.bidOrder4.add(this.bidOrder2);
          order = this.bidOrder4["delete"]();
          order.should.equal(this.bidOrder2);
          return expect(this.bidOrder2.parent).to.not.be.ok;
        });
      });
      describe('an Order with no parent and a higher but no lower Order', function() {
        return it('should return the higher Order', function() {
          var order;

          this.bidOrder4.add(this.bidOrder6);
          order = this.bidOrder4["delete"]();
          order.should.equal(this.bidOrder6);
          return expect(this.bidOrder6.parent).to.not.be.ok;
        });
      });
      return describe('an Order with no parent and both higher and lower BookEntries', function() {
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
    describe('#export', function() {
      return it('should return a JSON stringifiable object containing a snapshot of the order', function() {
        var json, object, order;

        order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: amount100,
          bidAmount: amount50
        });
        json = JSON.stringify(order["export"]());
        object = JSON.parse(json);
        order.id.should.equal(object.id);
        order.timestamp.should.equal(object.timestamp);
        order.account.should.equal(object.account);
        order.bidCurrency.should.equal(object.bidCurrency);
        order.offerCurrency.should.equal(object.offerCurrency);
        order.bidPrice.compareTo(new Amount(object.bidPrice)).should.equal(0);
        order.bidAmount.compareTo(new Amount(object.bidAmount)).should.equal(0);
        expect(object.offerPrice).to.not.be.ok;
        expect(object.offerAmount).to.not.be.ok;
        order = new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'EUR',
          offerCurrency: 'BTC',
          offerPrice: amount100,
          offerAmount: amount50
        });
        json = JSON.stringify(order["export"]());
        object = JSON.parse(json);
        order.id.should.equal(object.id);
        order.timestamp.should.equal(object.timestamp);
        order.account.should.equal(object.account);
        order.bidCurrency.should.equal(object.bidCurrency);
        order.offerCurrency.should.equal(object.offerCurrency);
        order.offerPrice.compareTo(new Amount(object.offerPrice)).should.equal(0);
        order.offerAmount.compareTo(new Amount(object.offerAmount)).should.equal(0);
        expect(object.bidPrice).to.not.be.ok;
        return expect(object.bidAmount).to.not.be.ok;
      });
    });
    return describe('#next', function() {
      return it('should return the next order in a tree if there is one', function() {
        var order1, order10, order11, order12, order13, order14, order15, order2, order3, order4, order5, order6, order7, order8, order9;

        order1 = newBidOrder(amount50);
        order2 = newBidOrder(amount51);
        order1.add(order2);
        order3 = newBidOrder(amount49);
        order1.add(order3);
        order4 = newBidOrder(amount52);
        order1.add(order4);
        order5 = newBidOrder(amount50Point5);
        order1.add(order5);
        order6 = newBidOrder(amount49Point5);
        order1.add(order6);
        order7 = newBidOrder(amount48Point5);
        order1.add(order7);
        order8 = newBidOrder(amount48Point5);
        order1.add(order8);
        order9 = newBidOrder(amount48Point75);
        order1.add(order9);
        order10 = newBidOrder(amount49Point5);
        order1.add(order10);
        order11 = newBidOrder(amount49Point75);
        order1.add(order11);
        order12 = newBidOrder(amount50Point5);
        order1.add(order12);
        order13 = newBidOrder(amount50Point75);
        order1.add(order13);
        order14 = newBidOrder(amount52);
        order1.add(order14);
        order15 = newBidOrder(amount53);
        order1.add(order15);
        order15.next().should.equal(order4);
        order4.next().should.equal(order14);
        order14.next().should.equal(order2);
        order2.next().should.equal(order13);
        order13.next().should.equal(order5);
        order5.next().should.equal(order12);
        order12.next().should.equal(order1);
        order1.next().should.equal(order11);
        order11.next().should.equal(order6);
        order6.next().should.equal(order10);
        order10.next().should.equal(order3);
        order3.next().should.equal(order9);
        order9.next().should.equal(order7);
        order7.next().should.equal(order8);
        return expect(order8.next()).to.not.be.ok;
      });
    });
  });

}).call(this);
