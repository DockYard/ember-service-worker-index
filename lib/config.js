'use strict';

const Plugin = require('broccoli-plugin');
const fs = require('fs');
const path = require('path');

module.exports = class Config extends Plugin {
  constructor(inputNodes, options) {
    super(inputNodes, {
      name: options && options.name,
      annotation: options && options.annotation
    });

    this.options = options;
  }

  build() {
    let options = this.options;
    let version = options.version || '1';
    let location = options.location || 'index.html';
    let excludeScope = options.excludeScope || [];
    let includeScope = options.includeScope || [];
    let fallback = options.fallback || false;

    let module = '';
    module += `export const VERSION = '${version}';\n`;
    module += `export const INDEX_HTML_PATH = '${location}';\n`;
    module += `export const INDEX_EXCLUDE_SCOPE = [${excludeScope}];\n`;
    module += `export const INDEX_INCLUDE_SCOPE = [${includeScope}];\n`;
    module += `export const INDEX_FALLBACK = ${fallback};\n`;

    fs.writeFileSync(path.join(this.outputPath, 'config.js'), module);
  }
};
