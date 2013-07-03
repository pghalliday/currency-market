(function() {
  var DepositDelta, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  DepositDelta = require('../../src/Delta/DepositDelta');

  describe('DepositDelta', function() {
    return it('should instantiate recording the supplied funds', function() {
      var depositDelta;
      depositDelta = new DepositDelta({
        funds: 'hello'
      });
      return depositDelta.funds.should.equal('hello');
    });
  });

}).call(this);
