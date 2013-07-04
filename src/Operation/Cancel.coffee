module.exports = class Cancel
  constructor: (params) ->
    @sequence = params.sequence
    if typeof @sequence == 'undefined'
      throw new Error 'Must supply a sequence number'
