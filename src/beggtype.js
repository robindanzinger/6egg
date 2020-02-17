function isPrim(type) {
  return type.group === 'prim'
}

function isObject(type) {
  return type.group === 'object'
}

function isArray(type) {
  return type.group === 'array'
}

function isReference(type) {
  if (isObject(type)) {
    return type.group === 'object' && type.reftype === 'ref'
  } else if (isArray(type)) {
    return isReference(type.itemtype)
  }
  return false
}

module.exports = {
  isPrim,
  isObject,
  isArray,
  isReference,
}
