'use strict';

var ConfigPlugin = require('../config');
var helper = require('broccoli-test-helper');
var md5Hash = require('../utils').md5Hash;

const createBuilder = helper.createBuilder;
const createTempDir = helper.createTempDir;


let tempDir;

describe('Config', () => {
  beforeEach(() => {
    return createTempDir().then(dir => {
      tempDir = dir;
      tempDir.write({
        "index.html": "moi"
      });
    });
  });

  it('includes a config.js in the output with defaults', () => {
    expect.assertions(1);

    let expectedHash = md5Hash('moi');
    let expected = `export const ENVIRONMENT = 'swamp';
export const VERSION = '1';
export const INDEX_HTML_PATH = 'index.html';
export const INDEX_EXCLUDE_SCOPE = [];
export const INDEX_INCLUDE_SCOPE = [];
self.INDEX_FILE_HASH = '${expectedHash}';
`;

    const plugin = new ConfigPlugin([tempDir.path()], {
      env: 'swamp'
    });
    const builder = createBuilder(plugin);
    return builder.build().then(() => {
      const output = builder.read();
      const actual = output['config.js'];
      expect(actual).toBe(expected);
    });
  });

  it('includes a config.js with override properties', async () => {
    expect.assertions(1);

    tempDir.write({
      "sample.html": "kissy kissy"
    });
    let expectedHash = md5Hash('kissy kissy');
    let expected = `export const ENVIRONMENT = 'swamp';
export const VERSION = '3.14';
export const INDEX_HTML_PATH = 'sample.html';
export const INDEX_EXCLUDE_SCOPE = [exclude test];
export const INDEX_INCLUDE_SCOPE = [include test];
self.INDEX_FILE_HASH = '${expectedHash}';
`;

    const plugin = new ConfigPlugin([tempDir.path()], {
      env: 'swamp',
      location: 'sample.html',
      version: '3.14',
      includeScope: ['include test'],
      excludeScope: ['exclude test']
    });
    const builder = createBuilder(plugin);
    return builder.build().then(() => {
      const output = builder.read();
      const actual = output['config.js'];
      expect(actual).toBe(expected);
    });
  });
});
