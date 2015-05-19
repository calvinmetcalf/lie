// Lazy man's symbols for states

exports.REJECTED = ['REJECTED'];
exports.FULFILLED = ['FULFILLED'];
exports.PENDING = ['PENDING'];

if (!process.browser) {
  exports.UNHANDLED = ['UNHANDLED'];
  exports.HANDLED = ['HANDLED'];
}
