(function() {
  var DepositResult, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  DepositResult = require('../../src/Delta/DepositResult');

  describe('DepositResult', function() {
    return it('should instantiate recording the supplied funds', function() {
      var depositResult;
      depositResult = new DepositResult({
        funds: 'hello'
      });
      return depositResult.funds.should.equal('hello');
    });
  });

}).call(this);
