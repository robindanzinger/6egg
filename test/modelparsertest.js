const { expect } = require('chai')
const { parse, parseField } = require('../src/modelparser')

describe('6egg model parser', function () {
  it.skip('can read types, we should use snapshottest here', async function () {
    const model = `
Author 
  _id id
  name string!
  addresses [Address] embed
  books [Book] ref

Book
  _id id
  title string!
  author Author! ref

Address embed
  street string!
  city string!
`
    console.dir(parse(model), {depth: null})
  })
})
describe('parseField', function () {
  it('parses simple fieldname and fieldtype', function () {
    const line = '  _id id'
    const field = parseField(line.split(' '))
    const expected = {
      name: '_id',
      group: 'prim',
      required: false,
      type: 'id'
    }
    expect(field).to.deep.include(expected)
  })
  it('parses required field', function () {
    const line = '  _id id!'
    const field = parseField(line.split(' '))
    const expected = {
      name: '_id',
      group: 'prim',
      required: true,
      type: 'id'
    }
    expect(field).to.deep.include(expected)
  })
  it('parses simple array field', function () {
    const line = '  array [string]'
    const field = parseField(line.split(' '))
    const expected = {
      name: 'array',
      group: 'array',
      required: false,
      itemtype: {
        group: 'prim',
        type: 'string',
        required: false,
      }
    }
    expect(field).to.deep.include(expected)

  })
  it('parses simple required array field', function () {
    const line = '  array [string]!'
    const field = parseField(line.split(' '))
    const expected = {
      name: 'array',
      required: true,
      group: 'array',
      itemtype: {
        type: 'string',
        group: 'prim',
        required: false
      }
    }
    expect(field).to.deep.include(expected)
  })
  it('parses simple required array field with required items', function () {
    const line = '  array [string!]!'
    const field = parseField(line.split(' '))
    const expected = {
      name: 'array',
      group: 'array',
      required: true,
      itemtype: {
        required: true,
        group: 'prim',
        type: 'string'
      }
    }
    expect(field).to.deep.include(expected)
  })
  it('parses simple object field', function () {
    const line = '  user User'
    const field = parseField(line.split(' '))
    const expected = {
      name: 'user',
      group: 'object',
      required: false,
      reftype: 'embed',
      type: 'User'
    }
    expect(field).to.deep.include(expected)
  })
  it('parses simple object ref field', function () {
    const line = '  user User ref'
    const field = parseField(line.split(' '))
    const expected = {
      name: 'user',
      group: 'object',
      required: false,
      reftype: 'ref',
      type: 'User'
    }
    expect(field).to.deep.include(expected)
  })
  it('parses object ref array field', function () {
    const line = '  user [User] ref'
    const field = parseField(line.split(' '))
    const expected = {
      name: 'user',
      group: 'array',
      required: false,
      itemtype: {
        group: 'object',
        reftype: 'ref',
        required: false,
        type: 'User'
      }
    }
    expect(field).to.deep.include(expected)
  })
  it('can append options to field description', function () {
    const line = '  user [User] ref -option1 value1 -option2 value2'
    const field = parseField(line.split(' '))
    const expected = {
      name: 'user',
      group: 'array',
      required: false,
      itemtype: {
        group: 'object',
        reftype: 'ref',
        required: false,
        type: 'User'
      },
      options: {
        option1: 'value1',
        option2: 'value2'
      }
    }
    expect(field).to.deep.include(expected)
  })
})
