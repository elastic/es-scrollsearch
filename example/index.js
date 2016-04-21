'use strict';

const search = require('../');

const url = 'http://localhost:9200/logstash-*/_search';
const params = { size: 1000, query: { term: { response: 200 } } };

search(url, params)
  .on('error', err => console.log('error', err.stack || err))
  .pipe(process.stdout);
