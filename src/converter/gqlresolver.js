const { isArray, isObject, isReference } = require('../beggtype')
function createAllResolver(beggmodel) {
  return '{\n' + beggmodel.types.map(createResolver).join('\n') + '\n}'
}

function createResolver(object) {
  const references = object.fields.filter(isReference)
  const referencesResolverString = references.map(createResolverForReference)
  return `${object.name}: {
${referencesResolverString.join('\n')}\n},`
}

function createResolverForReference(reference) {
  if (isObject(reference)) {
    return createResolverForObjectReference(reference)
  } 
  if (isArray(reference)) {
    return createResolverForArrayReference(reference)
  }
  return undefined
}

function createResolverForObjectReference(reference) {
  return `\
${reference.name}(parent, arg, {dataSources}) {
  return dataSources.${reference.type}.findById(parent.${reference.name}._id)
}`
}

function createResolverForArrayReference(reference) {
  const itemtype = reference.itemtype
  return `\
${reference.name}(parent, arg, {dataSources}) {
  return dataSources.${itemtype.type}.find({${reference.options.oppositeidfield}: parent._id})
}`
}

module.exports = {
  createAllResolver,
}
