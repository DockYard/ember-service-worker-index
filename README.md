# Ember Service Worker Index

**[ember-service-worker-index is built and maintained by DockYard, contact us for expert Ember.js consulting](https://dockyard.com/ember-consulting)**.

_An Ember Service Worker plugin that caches an Ember app's index file_

## F#$& my assets aren't updating in development mode

Turn on the "Update on reload" setting in the `Application > Service Workers`
menu in the Chrome devtools.

## Installation

```
ember install ember-service-worker-index
```

## Configuration

The configuration is done in the `ember-cli-build.js` file:

```js
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    'esw-index': {
      // Where the location of your index file is at, defaults to `index.html`
      location: 'app-shell.html',

      // Bypass esw-index and don't serve cached index file for matching URLs
      excludeScope: [/\/non-ember-app(\/.*)?$/, /\/another-app(\/.*)?$/],

      // Leave blank serve index file for all URLs, otherwise ONLY URLs which match
      // this pattern will be served the cached index file so you will need to list
      // every route in your app.
      includeScope: [/\/dashboard(\/.*)?$/, /\/admin(\/.*)?$/],

      // changing this version number will bust the cache
      version: '1'
    }
  });

  return app.toTree();
};
```

## Authors

* [Marten Schilstra](http://twitter.com/martndemus)

## Versioning

This library follows [Semantic Versioning](http://semver.org)

## Want to help?

Please do! We are always looking to improve this library. Please see our
[Contribution Guidelines](https://github.com/dockyard/ember-service-worker-index/blob/master/CONTRIBUTING.md)
on how to properly submit issues and pull requests.

## Legal

[DockYard](http://dockyard.com/), Inc. &copy; 2016

[@dockyard](http://twitter.com/dockyard)

[Licensed under the MIT license](http://www.opensource.org/licenses/mit-license.php)
