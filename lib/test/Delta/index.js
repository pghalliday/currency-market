(function() {
  var Delta, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  Delta = require('../../src/Delta');

  describe('Delta', function() {
    return it('should instantiate recording a supplied sequence number, operation and result', function() {
      var delta;
      delta = new Delta({
        sequence: 0,
        operation: 'my operation',
        result: 'my result'
      });
      delta.sequence.should.equal(0);
      delta.operation.should.equal('my operation');
      return delta.result.should.equal('my result');
    });
  });

}).call(this);
