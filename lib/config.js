"use strict";

const Plugin = require("broccoli-plugin");
const fs = require("fs");
const path = require("path");
const md5Hash = require("./utils").md5Hash;

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
    let version = options.version || "1";
    let location = options.location || "index.html";
    let excludeScope = options.excludeScope || [];
    let includeScope = options.includeScope || [];

    let fileLocation = location;
    if (fileLocation[fileLocation.length - 1] === "/") {
      fileLocation = fileLocation + "index.html";
    }

    let indexFilePath = path.join(this.inputPaths[0], fileLocation);
    let hash = md5Hash(fs.readFileSync(indexFilePath).toString());

    let module = "";
    module += `export const ENVIRONMENT = '${options.env}';\n`;
    module += `export const VERSION = '${version}';\n`;
    module += `export const INDEX_HTML_PATH = '${location}';\n`;
    module += `export const INDEX_EXCLUDE_SCOPE = [${excludeScope}];\n`;
    module += `export const INDEX_INCLUDE_SCOPE = [${includeScope}];\n`;
    module += `self.INDEX_FILE_HASH = '${hash}';\n`;

    fs.writeFileSync(path.join(this.outputPath, "config.js"), module);
  }
};
