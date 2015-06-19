var VerEx  = require('verbal-expressions')
  , R      = require('../ramda.custom')

var buildBase = function (data) {
  if(!Array.isArray(data)) throw new Error("Base should be an Array.")

  return data.map(function (item, idx) {
    if(item === null || item === undefined) return
    var typeofItem = typeof item

    if(Array.isArray(item))    return buildBase(item)
    if(typeofItem == 'string') return normalize(item)
    if(typeofItem == 'object') return normalizeObject(item)
  })
  .filter(onlyValids)
}

var normalizeObject = function (data) {
  return Object.keys(data)
          .reduce(function (object, key) {
            var item = data[key]
            if(item === null || item === undefined) return object
            var typeofItem = typeof item
            var prop = null

            if(typeofItem == 'string') prop = normalize(item)
            if(Array.isArray(item))    prop = buildBase(item)
            if(typeofItem == 'object' && !Array.isArray(item)) prop = normalizeObject(item)

            if(onlyValids(prop)) object[key] = prop
            return object
          }, {})
}

var buildEngine = function (base) {
  return {
      search: search(base)
    , base: base
  }
}

var search = R.curry(function (base, query) {
  if(normalize(query).length == 0) return base // to avoid useless processing
  
  query = query.toLowerCase()

  var term       = VerEx().find(normalize(query))
  var markTerm   = replace(normalize(query))
  var markAndHighlight = R.compose(highlight, markTerm)

  return searchWithinArray(base, term, markAndHighlight)
})

var searchWithinArray = function (base, term, markAndHighlight) {
  return base.map(function (item) {
    var typeofItem = typeof item

    if(typeofItem == 'string' && test(term, item)) return markAndHighlight(item) 
    if(Array.isArray(item)) return searchWithinArray(item, term, markAndHighlight)
    if(typeofItem == 'object' && !Array.isArray(item)) return searchWithinObject(item, term, markAndHighlight)
  })
  .filter(onlyValids)
}

var searchWithinObject = function (base, term, markAndHighlight) {
  return Object.keys(base).reduce(function (object, key) {
    var item = base[key]
    var typeofItem = typeof item
    var prop = null

    if(typeofItem == 'string' && test(term, item)) prop = markAndHighlight(item) 
    if(Array.isArray(item)) prop = searchWithinArray(item, term, markAndHighlight)
    if(typeofItem == 'object' && !Array.isArray(item)) prop = searchWithinObject(item, term, markAndHighlight)

    if(onlyValids(prop)) object[key] = prop
    return object
  }, {})
}

var replace = R.curry(function (to, phrase) {
  return (R.compose(mark(phrase), markRanges(phrase))(to))
    .reduce(function (newPhrase, mark) {
      return VerEx().find(mark.term).replace(newPhrase, mark.marked)
    }, phrase)
})

var mark = R.curry(function (phrase, ranges) {
  return ranges.map(function (range) {
    var term = phrase.slice(R.head(range), R.last(range))
    return {
        marked: '<' + term + '>'
      , term: term
    }
  })
})

var markRanges = R.curry(function (phrase, to) {
  var inits = [].reduce.call(phrase, function (ranges, letter, idx) {
    return ranges.concat(phrase.toLowerCase().indexOf(to, idx)) 
  }, [])
  .filter(R.lte(0))

  return R.compose(R.map(genRange(to.length)), R.uniqWith(NumberEq)) (inits)
})

var genRange = R.curry(function (last, init) {
  return [init, init + last]
})

var NumberEq = function (a, b) {
  return Number(a) == Number(b)
}

var normalize = function (phrase) {
  return phrase.trim()
}

var onlyValids = function (item) {
  return item !== null && (typeof item != 'object' || Object.keys(item).length > 0)
}

var test = function (term, value) {
  value = value.toLowerCase()
  return term.test(value) || term.test(value)
}

var highlight = function(word) {
  var head = R.split('<', word)
  var tail = R.tail(head)
    .map(R.split('>'))
    .reduce(R.concat, [])

  return word.localeCompare(R.head(head)) === 0 ?
      [{
          chunk     : R.head(head)
        , highlight : false
      }]
    : R.concat([R.head(head)], tail).map(function (chunk, index){
        return {
            content     : chunk
          , highlight : index % 2 !== 0 
        }
      })
      .filter(function (chunk) {
        return chunk.content.length > 0
      })
}

module.exports = function (data) {
  return R.compose(buildEngine, buildBase)(data)
}