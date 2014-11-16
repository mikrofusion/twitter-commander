var BaconAndEggs = require('bacon-and-eggs');
var Bacon = BaconAndEggs.Bacon;
var gob = require('gob').gob(process.stdout);

var ViewManager = function() {
  this._currentViewName = new Bacon.Bus();
  this._commandList = [];
  this._viewList = [];
  this._env = {};
};

ViewManager.prototype.start = function(keyStream, ioInterface, creds) {
  this._env.ioInterface = ioInterface;
  var _this = this;

  Bacon.onValues(keyStream, this._currentViewName, function(key, viewName) {
    return _this.getViewEvents(viewName)(ioInterface, key);
  });

  var viewDataStream = Bacon.fromEventTarget(ioInterface, 'line').flatMap(function(command) {

    gob.set();

    if (_this.hasCommand(command)) {
      _this._currentViewName.push(_this.getViewName(command));
      return _this.getAction(command)(creds);
    } else {
      return Bacon.once(null);
    }
  });

  Bacon.onValues(viewDataStream, this._currentViewName, function(viewData, view) {
    gob.vanish();
    return _this.getView(view)(_this._env, viewData);
  });

  this.setView('prompt');
};

ViewManager.prototype.addCommand = function(name, desc, viewName, action) {
  this._commandList[name] = {
    desc: desc,
    viewName: viewName,
    action: action
  };
};

ViewManager.prototype.addView = function(name, view, events) {
  this._viewList[name] = {
    view: view,
    events: events
  };
};

ViewManager.prototype.hasCommand = function(command) {
  return this._commandList[command] != null;
};

ViewManager.prototype.getView = function(viewName) {
  if (this._viewList[viewName] != null) {
    return this._viewList[viewName].view;
  } else {
    return null;
  }
};

ViewManager.prototype.getViewEvents = function(viewName) {
  if (this._viewList[viewName] != null) {
    return this._viewList[viewName].events;
  } else {
    return null;
  }
};

ViewManager.prototype.getViewName = function(command) {
  if (this._commandList[command] != null) {
    return this._commandList[command].viewName;
  } else {
    return null;
  }
};

ViewManager.prototype.setView = function(viewName) {
  gob.vanish();
  this._currentViewName.push(viewName);
};

ViewManager.prototype.getAction = function(command) {
  if (this._commandList[command] != null) {
    return this._commandList[command].action;
  } else {
    return null;
  }
};

module.exports = new ViewManager();
