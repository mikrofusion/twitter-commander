var fs = require('fs');
require.extensions['.txt'] = function(module, filename) {
  return module.exports = fs.readFileSync(filename, 'utf8');
};
