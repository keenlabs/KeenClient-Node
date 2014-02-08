var triggers = module.exports;

triggers.isQueueBeyondLimit = function () {
    return this._queue.length >= this._flushOptions.atEventQuantity;
};

triggers.hasTimePassedSinceLastFlush = function () {
    return Date.now() - this._lastFlush > this._flushOptions.afterTime;
};