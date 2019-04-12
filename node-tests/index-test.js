/* globals suite, test */
/* jshint node: true, esnext: false, expr: true */
/* jscs: disable */
'use strict';

var addonIndex = require('../index');
var assert = require('chai').assert;
var createTempDir = require('broccoli-test-helper').createTempDir;
var createReadableDir = require('broccoli-test-helper').createReadableDir;
var fs = require('fs');

describe('Addon index', function() {
  describe('included', () => {
    it('sets default options', () => {
      const scope = { _super: {} };
      addonIndex.included.call(scope, {});

      let expected = {
        'esw-index': {}
      };

      assert.deepEqual(scope.app.options, expected);
    });

    it('preserves configured options', () => {
      let options = {
        'esw-index': {
          foo: 'bar'
        }
      };

      const scope = { _super: {} };
      addonIndex.included.call(scope, { options });
      assert.deepEqual(scope.app.options, options);
    });
  });

  describe('treeForServiceWorker', () => {
    let tempDir, swDir;
    beforeEach(() => {
      return createTempDir()
      .then(dir => {
        tempDir = dir;
        return createTempDir();
      })
      .then(dir => {
        swDir = dir;
      });
    });

    it('adds the configuration to the tree', () => {
      let calledMock = false;
      const scope = {
        _super: {},
        app: {
          env: 'theater',
          options: {
            'esw-index': {
              'priviledge': 'scooter'
            }
          }
        },
        _generateConfig: (appTree, options) => {
          calledMock = true;
          assert.equal(appTree, 'app');
          assert.deepEqual(options, {
            env: 'theater',
            priviledge: 'scooter'
          });
          return 'config.js';
        }
      }
      tempDir.write({
        "config.js": "uncle"
      });
      const merged = addonIndex.treeForServiceWorker.call(scope, swDir, 'app');
      assert.isTrue(calledMock);
      assert.equal(merged.inputNodes.length, 2);
      assert.equal(merged.inputNodes[1], 'config.js');
    });
  });
});
