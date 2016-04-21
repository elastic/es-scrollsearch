'use strict';

module.exports = function createScrollState(cb) {
  let hasHits = false;
  let scrollId = null;

  const invokeCallbackIfReady = () => {
    if (hasHits && scrollId !== null) {
      cb(scrollId);
      hasHits = false;
      scrollId = null;
    }
  }

  return {
    handleHit() {
      hasHits = true;
      invokeCallbackIfReady();
    },
    handleScrollId(id) {
      scrollId = id;
      invokeCallbackIfReady();
    }
  };
}
