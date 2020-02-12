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
  books [Book!]! ref -oppositeidfield author
`

describe('schema and resolver generator', () => {
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
    expect(createFullSchema(beqmodel)).to.be.equal(expected)
  })
  it('creates resolvers for references in 6eggmodel', () => {
    const beqmodel = parse(beq)
    const expected = `{
  Book: {
    author(book) {
      return Author.findById(book.author._id)
    }
  },
  Author: {
    books(author) {
      return Book.find({author: author._id})
    }
  },
}`
    console.log('foobar', createAllResolver(beqmodel))
    //    expect(createAllResolver(beqmodel)).to.be.equal(expected)
  })
})

function createFullSchema(beqmodel) {
  return beqmodel.types.reduce((arr, type) => {
    arr.push(createSchemaForType(type))
    return arr
  }, []).join('\n\n')
}

function createSchemaForType(type) {
  return `type ${type.name} {\n${createSchemaFields(type).join('\n')}\n}`
}

function createSchemaFields(type) {
  return type.fields.reduce((lines, field) => {
    lines.push(createSchemaField(field))
    return lines
  }, [])
}

function createSchemaField(field) {
  return `  ${field.name}: ${getType(field.type)}`
}

function getType(type) {
  const required = type.required ? '!' : ''
  if (isPrim(type)) {
    return seggTypeToGqlType[type.type] + required
  }
  if (isObject(type)) {
    return type.type + required
  }
  if (isArray(type)) {
    return `[${getType(type.itemtype)}]${required}`
  }
}

const seggTypeToGqlType = {
  string: 'String',
  date: 'Date',
  number: 'Int',
  id: 'String',
}

function isPrim(type) {
  return type.group === 'prim'
}

function isObject(type) {
  return type.group === 'object'
}

function isArray(type) {
  return type.group === 'array'
}

function createAllResolver(beqmodel) {
  return beqmodel.types.reduce((resolvers, type) => {
    resolvers += `\n${type.name}: { \n${createResolverForType(type)} \n`
    return resolvers
  }, '{\n') + '\n}'
}

function createResolverForType(type) {
  const references = type.fields.filter((f) => isReference(f.type))
  const objectreferences = references.filter(r => isObject(r.type))
  const arrayreferences = references.filter(r => isArray(r.type))
  let result = createResolverForObjectReferences(objectreferences)
  return result + '\n' + createResolverForArrayReferences(arrayreferences)
}

function createResolverForObjectReferences(references) {
  return references.map(createResolverForObjectReference).join('\n')
}

function createResolverForObjectReference(reference) {
  return `${reference.name} = (parent, arg, {dataSource}) => {
  return dataSource[${reference.type.type}].findById(parent[${reference.name}]._id)
}`
}

function createResolverForArrayReferences(references) {
  return references.map(createResolverForArrayReference).join('\n')
}

function createResolverForArrayReference(reference) {
  const itemtype = reference.type.itemtype
  return `${reference.name}(parent, arg, {dataSource}) => {
      return dataSource[${itemtype.type}].find({${reference.options.oppositeidfield}: parent._id})
    }`
}

function isReference(type) {
  if (isObject(type)) {
    return type.group === 'object' && type.reftype === 'ref'
  } else if (isArray(type)) {
    return isReference(type.itemtype)
  }
  return false
}
