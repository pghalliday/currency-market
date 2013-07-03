module.exports = class Delta
  constructor: (params) ->
    @sequence = params.sequence
    @operation = params.operation
    @result = params.result
