const { expect } = require('chai')

describe('6egg model parser', function () {
  it('can read types', async function () {
    const model = `
User 
  _id id
  name string!
  addresses [Adress] embed

Book
  _id id
  title string!
  author User! ref

Adress embed
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
      type: {
        group: 'prim',
        required: false,
        type: 'id'
      }
    }
    expect(field).to.deep.include(expected)
  })
  it('parses required field', function () {
    const line = '  _id id!'
    const field = parseField(line.split(' '))
    const expected = {
      name: '_id',
      type: {
        group: 'prim',
        required: true,
        type: 'id'
      }
    }
    expect(field).to.deep.include(expected)
  })
  it('parses simple array field', function () {
    const line = '  array [string]'
    const field = parseField(line.split(' '))
    const expected = {
      name: 'array',
      type: {
        group: 'array',
        required: false,
        itemtype: {
          group: 'prim',
          type: 'string',
          required: false,
        }
      }
    }
    expect(field).to.deep.include(expected)

  })
  it('parses simple required array field', function () {
    const line = '  array [string]!'
    const field = parseField(line.split(' '))
    const expected = {
      name: 'array',
      type: {
        required: true,
        group: 'array',
        itemtype: {
          type: 'string',
          group: 'prim',
          required: false
        }
      }
    }
    expect(field).to.deep.include(expected)
  })
  it('parses simple required array field with required items', function () {
    const line = '  array [string!]!'
    const field = parseField(line.split(' '))
    const expected = {
      name: 'array',
      type: {
        group: 'array',
        required: true,
        itemtype: {
          required: true,
          group: 'prim',
          type: 'string'
        }
      }
    }
    expect(field).to.deep.include(expected)
  })
  it('parses simple object field', function () {
    const line = '  user User'
    const field = parseField(line.split(' '))
    const expected = {
      name: 'user',
      type: {
        group: 'object',
        required: false,
        reftype: 'embed',
        type: 'User'
      }
    }
    expect(field).to.deep.include(expected)
  })
  it('parses simple object ref field', function () {
    const line = '  user User ref'
    const field = parseField(line.split(' '))
    const expected = {
      name: 'user',
      type: {
        group: 'object',
        required: false,
        reftype: 'ref',
        type: 'User'
      }
    }
    expect(field).to.deep.include(expected)
  })
  it('parses object ref array field', function () {
    const line = '  user [User] ref'
    const field = parseField(line.split(' '))
    const expected = {
      name: 'user',
      type: {
        group: 'array',
        required: false,
        itemtype: {
          group: 'object',
          reftype: 'ref',
          required: false,
          type: 'User'
        }
      }
    }
    expect(field).to.deep.include(expected)
  })
  it('can append options to field description', function () {
    const line = '  user [User] ref -option1 value1 -option2 value2'
    const field = parseField(line.split(' '))
    const expected = {
      name: 'user',
      type: {
        group: 'array',
        required: false,
        itemtype: {
          group: 'object',
          reftype: 'ref',
          required: false,
          type: 'User'
        }
      },
      options: {
        option1: 'value1',
        option2: 'value2'
      }
    }
    expect(field).to.deep.include(expected)
  })
})

function parse(model) {
  const lines = model.split('\n')
  const m = {
    types: [],
  }
  lines.reduce((type, line) => {
    if (line.trim() === '') return type
    const values = line.split(' ')
    if (values[0] !== '') {
      type = parseType(values)
      m.types.push(type)
    } else {
      type.fields.push(parseField(values))
    }
    return type
  })

  return m
}

function parseType(values) {
  return {
    name: values[0],
    type: values[1] || 'base',
    fields: [],
  }
}

function parseField(values) {
  const fvalues = values.filter(v => v !== '')
  const name = fvalues[0]
  const type = parseFieldType(fvalues[1], fvalues)
  const options = parseOptions(fvalues)
  return {name, type, options}
}

function parseFieldType(value, values) {
  const isArray = value.indexOf('[') >= 0
  return isArray ? parseArray(value, values) : parseItemType(value, values)
}

function parseItemType(value, values) {
  const required = value.indexOf('!') > 0
  const type = required ? value.substring(0, value.length - 1) : value
  return isPrim(type) ? parsePrimType(required, type) : parseObjectType(required, type, values)
}
function parsePrimType(required, type) {
  return {group: 'prim', required, type}
}

function parseObjectType(required, type, values) {
  const reftype = values[2] ? values[2] : 'embed'
  return {group: 'object', required, type, reftype}
}

function isPrim(type) {
  return ['id', 'string', 'number', 'float', 'date', 'bool'].some(e => e === type)
}

function parseArray(value, values) {
  const itemtype = parseItemType(value.substring(value.indexOf('[') + 1, value.indexOf(']')), values)
  const required = value.substring(value.indexOf(']')).indexOf('!') > 0
  return {
    group: 'array', 
    required, 
    itemtype
  }
}

function parseOptions(values) {
  if (!values) return undefined
  const options = [] 
  values.reduce((opt, val) => {
    if (val.startsWith('-')) {
      const option = {}
      option.name = val.substring(1)
      options.push(option)
      return option
    }
    else if (opt) {
      opt.value = val
      return opt
    }
    return undefined
  })
  return options.reduce((acc, cur) => {
    acc[cur.name] = cur.value
    return acc
  }, {})
}
  
