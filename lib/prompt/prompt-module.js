var chalk = require('chalk');

module.exports = function(viewManager) {
  var setPrompt = function(stdinOut) {
    stdinOut.setPrompt(chalk.blue('twitter-commander> '), 19);
    return stdinOut.prompt();
  };

  var promptView = function(env) {
    return setPrompt(env.ioInterface);
  };

  viewManager.addView('prompt', promptView, function() {});
};
