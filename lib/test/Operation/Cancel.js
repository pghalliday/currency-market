(function() {
  var Cancel, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  Cancel = require('../../src/Operation/Cancel');

  describe('Cancel', function() {
    it('should error if no sequence number is supplied', function() {
      return expect(function() {
        var cancel;

        return cancel = new Cancel({});
      }).to["throw"]('Must supply a sequence number');
    });
    return it('should instantiate recording the sequence number', function() {
      var cancel;

      cancel = new Cancel({
        sequence: 0
      });
      return cancel.sequence.should.equal(0);
    });
  });

}).call(this);
