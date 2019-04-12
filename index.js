/* jshint node: true */
'use strict';

var Config = require('./lib/config');
var mergeTrees = require('broccoli-merge-trees');

module.exports = {
  name: 'ember-service-worker-index',

  included: function(app) {
    this._super.included && this._super.included.apply(this, arguments);
    this.app = app;
    this.app.options = this.app.options || {};
    this.app.options['esw-index'] = this.app.options['esw-index'] || {};
  },

  treeForServiceWorker(swTree, appTree) {
    var options = this.app.options['esw-index'];
    options.env = this.app.env;
    var configFile = this._generateConfig(appTree, options);

    return mergeTrees([swTree, configFile]);
  },

  _generateConfig(appTree, options) {
    return new Config([appTree], options);
  }
};
