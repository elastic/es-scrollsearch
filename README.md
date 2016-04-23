# Elasticsearch Scrolling Search [![Circle CI](https://circleci.com/gh/elastic/node-scrollsearch.svg?style=svg)](https://circleci.com/gh/elastic/node-scrollsearch)

Scroll through all Elasticsearch search results as a single stream

## Requirements

* Node.js >= 4.3.0

## Usage

```js
const streamHits = require('@elastic/scrollsearch');

const url = 'http://localhost:9200/logstash-*/_search';
const params = { query: { term: { response: 200 } } };

streamHits(url, params).pipe(someOtherStream);
```

## Installation

Install into your project via npm:

```
npm install @elastic/scrollsearch --save
```

## Testing

Either run tests as a once off:

```
npm test
```

Or continuously re-run tests whenever files change:

```
npm run test:dev
```
