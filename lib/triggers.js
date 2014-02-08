var triggers = module.exports;

triggers.isQueueBeyondLimit = function () {
    return this._queue.length >= this.options.flushAt;
};

triggers.hasTimePassedSinceLastFlush = function () {
    return Date.now() - this._lastFlush > this.options.flushAfter;
};