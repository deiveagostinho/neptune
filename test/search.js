var search     = require('../src/search')
  , R          = require('ramda')
  , expect     = require('chai').expect
  , data       = require('../test/text.json')
        
describe('Search', () => {
  var engine  = search(data)
  var base    = R.clone(engine.base)
  var results = [
                  {"spaces":
                    [
                      {"name":[{
                        "content":"De",
                        "highlight":true},
                        {"content":"sign",
                        "highlight":false}
                      ]},
                      {"name":[{
                        "content":"De",
                        "highlight":true},
                        {"content":"velopment",
                        "highlight":false}
                      ]}
                    ]
                  }
                ]

  it('should return an ok engine', () => {
    expect(engine).to.be.ok
    expect(engine).to.include.keys('base', 'search')
  })

  it('should search correctly', () => {
    expect(engine.base).to.be.deep.equal(base)
    expect(engine.search('de')).to.be.deep.equal(results)
    expect(engine.base).to.be.deep.equal(base)
  })
})