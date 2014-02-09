var triggers = module.exports;

// By default the library will flush:
// * On the first event.
// * Every `this._flushOptions.atEventQuantity` events.
// * If `this._flushOptions.afterTime` milliseconds has passed since the last flush.

triggers.isQueueBeyondLimit = function () {
    return this._queue.length >= this._flushOptions.atEventQuantity;
};

triggers.hasTimePassedSinceLastFlush = function () {
    return Date.now() - this._lastFlush > this._flushOptions.afterTime;
};