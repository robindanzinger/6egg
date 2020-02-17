const { isArray, isObject, isReference } = require('../beggtype')
function createAllResolver(beggmodel) {
  return '{\n' + beggmodel.types.map(createResolver).join('\n') + '\n}'
}

function createResolver(type) {
  const references = type.fields.filter((f) => isReference(f.type))
  const referencesResolverString = references.map(createResolverForReference)
  return `${type.name}: {
${referencesResolverString.join('\n')}\n},`
}

function createResolverForReference(reference) {
  if (isObject(reference.type)) {
    return createResolverForObjectReference(reference)
  } 
  if (isArray(reference.type)) {
    return createResolverForArrayReference(reference)
  }
  return undefined
}

function createResolverForObjectReference(reference) {
  return `\
${reference.name}(parent, arg, {dataSource}) => {
  return dataSource.${reference.type.type}.findById(parent.${reference.name}._id)
})`
}

function createResolverForArrayReference(reference) {
  const itemtype = reference.type.itemtype
  return `\
${reference.name}(parent, arg, {dataSource}) => {
  return dataSource.${itemtype.type}.find({${reference.options.oppositeidfield}: parent._id})
})`
}

module.exports = {
  createAllResolver,
}
