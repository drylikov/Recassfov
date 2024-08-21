const objectToUrlEncoded = (element, key, list) => {
  list = list || []
  if (typeof element === 'object') {
    for (let idx in element) {
      objectToUrlEncoded(element[idx], key ? key + '[' + idx + ']' : idx, list)
    }
  } else {
    list.push(key + '=' + encodeURIComponent(element))
  }
  return list.join('&')
}

module.exports = objectToUrlEncoded
