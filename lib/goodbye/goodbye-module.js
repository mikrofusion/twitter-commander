module.exports = function(viewManager) {
  var goodbyeView = function() {
    console.log('\nbye.');
    return process.exit(0);
  };

  viewManager.addCommand('exit', '', 'goodbye', function() { });
  viewManager.addView('goodbye', goodbyeView, function() {});
};
