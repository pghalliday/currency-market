(function() {
  var CurrencyMarket, assert, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  assert = chai.assert;

  CurrencyMarket = require('../src/');

  describe('CurrencyMarket', function() {
    describe('#Engine', function() {
      return it('should construct an engine', function() {
        var engine;
        engine = new CurrencyMarket.Engine();
        return engine.should.be.an.instanceOf(CurrencyMarket.Engine);
      });
    });
    describe('#Amount', function() {
      return it('should construct an Amount', function() {
        var amount;
        amount = new CurrencyMarket.Amount('200');
        return amount.should.be.an.instanceOf(CurrencyMarket.Amount);
      });
    });
    return describe('#Order', function() {
      return it('should construct an Order', function() {
        var order;
        order = new CurrencyMarket.Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'name',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: new CurrencyMarket.Amount('100'),
          bidAmount: new CurrencyMarket.Amount('50')
        });
        return order.should.be.an.instanceOf(CurrencyMarket.Order);
      });
    });
  });

}).call(this);
