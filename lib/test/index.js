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
    return describe('#Amount', function() {
      return it('should construct an Amount', function() {
        var amount;
        amount = new CurrencyMarket.Amount('200');
        return amount.should.be.an.instanceOf(CurrencyMarket.Amount);
      });
    });
  });

}).call(this);
