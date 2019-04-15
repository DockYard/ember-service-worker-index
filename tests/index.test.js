/* globals suite, test */
/* jshint node: true, esnext: false, expr: true */
/* jscs: disable */
'use strict';

var addonIndex = require('../index');
var createTempDir = require('broccoli-test-helper').createTempDir;

describe('Addon index', function() {
  describe('included', () => {
    it('sets default options', () => {
      expect.assertions(1);
      const scope = { _super: {} };
      addonIndex.included.call(scope, {});

      let expected = {
        'esw-index': {}
      };

      expect(scope.app.options).toEqual(expected);
    });

    it('preserves configured options', () => {
      expect.assertions(1);

      let options = {
        'esw-index': {
          foo: 'bar'
        }
      };

      const scope = { _super: {} };
      addonIndex.included.call(scope, { options });
      expect(scope.app.options).toEqual(options);
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
      expect.assertions(4);

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
          expect(appTree).toBe('app');
          expect(options).toEqual({
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
      expect(merged.inputNodes.length).toBe(2);
      expect(merged.inputNodes[1]).toBe('config.js');
    });
  });
});
