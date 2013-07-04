chai = require 'chai'
chai.should()
expect = chai.expect

Cancel = require '../../src/Operation/Cancel'

describe 'Cancel', ->
  it 'should error if no sequence number is supplied', ->
    expect ->
      cancel = new Cancel {}
    .to.throw 'Must supply a sequence number'

  it 'should instantiate recording the sequence number', ->
    cancel = new Cancel
      sequence: 0
    cancel.sequence.should.equal 0
    cancel = new Cancel
      exported: JSON.parse JSON.stringify cancel
    cancel.sequence.should.equal 0

