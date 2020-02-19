function isPrim(field) {
  return field.group === 'prim'
}

function isObject(field) {
  return field.group === 'object'
}

function isArray(field) {
  return field.group === 'array'
}

function isReference(field) {
  if (isObject(field)) {
    return field.group === 'object' && field.reftype === 'ref'
  } else if (isArray(field)) {
    return isReference(field.itemtype)
  }
  return false
}

function isEmbed(field) {
  if (isObject(field)) {
    return field.reftype === 'embed'
  } else if (isArray(field)) {
    return isEmbed(field.itemtype)
  }
  return false
}

module.exports = {
  isPrim,
  isObject,
  isArray,
  isReference,
  isEmbed,
}
