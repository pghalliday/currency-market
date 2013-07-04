(function() {
  var Cancel;

  module.exports = Cancel = (function() {
    function Cancel(params) {
      this.sequence = params.sequence;
      if (typeof this.sequence === 'undefined') {
        throw new Error('Must supply a sequence number');
      }
    }

    return Cancel;

  })();

}).call(this);
