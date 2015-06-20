![](https://raw.githubusercontent.com/jugoncalves/neptune/master/media/neptune.jpg)

neptune [![Build Status](https://travis-ci.org/jugoncalves/neptune.svg?branch=master)](https://travis-ci.org/jugoncalves/neptune)
===

Super small full-text search for JavaScript.

Why
---

Neptune was build to make it ease to add *simple* text search to your application, without relying in big'n'complex solutions out there. 

Neptune is perfect if you need to build a search field for a collection of data. It can find the matching criteria within a string and also highlights the matching substring for the whole collection you've provided. Capitalization remains untouched.

Getting Started
---

Grab it from npm

```bash
$ npm install --save s.neptune
```

Require it and build your engine based on your data collection

```javascript
var neptune = require('s.neptune')
  , request = require('kakuna')

request
  .get('/api/pet')
  .end()
  .then((res) => neptune(res.body))
  .then((engine) => engine.search('bob'))
  .then((results) => console.log(results)) 

  /* => results: [{[{ content:"Big",
                      highlight: false  },{
                      content:"Bob",
                      highlight:true
                  }]}]
  */

```

License
---
MIT