(function() {
  var CurrencyMarket, assert, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  assert = chai.assert;

  CurrencyMarket = require('../src/');

  describe('CurrencyMarket', function() {
    describe('#Market', function() {
      return it('should construct a market', function() {
        var market;
        market = new CurrencyMarket.Market({
          currencies: ['EUR', 'USD', 'BTC']
        });
        return market.should.be.an.instanceOf(CurrencyMarket.Market);
      });
    });
    describe('#Account', function() {
      return it('should construct an Account', function() {
        var account;
        account = new CurrencyMarket.Account({
          id: '123456789',
          timestamp: '987654321',
          key: 'Peter',
          currencies: ['EUR', 'USD', 'BTC']
        });
        return account.should.be.an.instanceOf(CurrencyMarket.Account);
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
