(function() {
  var Delta;

  module.exports = Delta = (function() {
    function Delta(params) {
      this.sequence = params.sequence;
      this.operation = params.operation;
      this.result = params.result;
    }

    return Delta;

  })();

}).call(this);
