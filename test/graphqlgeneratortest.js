const { expect } = require('chai')
const { parse } = require('../src/modelparser')

const beq = `
Book
  _id id!
  title string!
  author Author! ref 

Author
  _id id!
  name string
  books [Book!]!
`

describe.only('schema and resolver generator', () => {
  it('creates simple gql schema from 6eggmodel', () => {
    const beqmodel = parse(beq)
    const expected = `type Book {
  _id: String!
  title: String!
  author: Author!
}

type Author {
  _id: String!
  name: String
  books: [Book!]!
}`
    expect(createSchema(beqmodel)).to.be.equal(expected)
  })
})

function createSchema(beqmodel) {
  return beqmodel.types.reduce((arr, type) => {
    arr.push(`type ${type.name} {\n` + createSchemaFields(type).join('\n') + '\n}')
    return arr
  }, []).join('\n\n')
}

function createSchemaFields(type) {
  return type.fields.reduce((lines, field) => {
    lines.push(createSchemaField(field))
    return lines
  }, [])
}

function createSchemaField(field) {
  return `  ${field.name}: ${getType(field)}`
}

function getType(field) {
  const required = field.type.required ? '!' : ''
  if (isPrim(field)) {
    return seggTypeToGqlType[field.type.type] + required
  }
  if (isObject(field)) {
    return field.type.type + required
  }
  if (isArray(field)) {
    return `[${getItemType(field)}]${required}`
  }
}

function getItemType(field) {
  return getType({type: field.type.itemtype})
}

const seggTypeToGqlType = {
  string: 'String',
  date: 'Date',
  number: 'Int',
  id: 'String',
}

function isPrim(field) {
  return field.type.group === 'prim'
}

function isObject(field) {
  return field.type.group === 'object'
}

function isArray(field) {
  return field.type.group === 'array'
}

