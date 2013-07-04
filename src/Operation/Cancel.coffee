module.exports = class Cancel
  constructor: (params) ->
    exported = params.exported
    if exported
      params = exported
    @sequence = params.sequence
    if typeof @sequence == 'undefined'
      throw new Error 'Must supply a sequence number'
