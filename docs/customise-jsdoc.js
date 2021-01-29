/**
 * Plugin to customise JSDoc parsing
 *
 */
const env = require('jsdoc/env');

const config = env.conf['customise-jsdoc'] || {};

const hasOwnProp = Object.prototype.hasOwnProperty;
exports.handlers = {
    /** Remove 'exports.' from declaration names
     *
     *
     * @param {Object} symbol
     */
    symbolFound(symbol) {
        if (symbol.code && symbol.code.name && symbol.code.name.indexOf('exports.') === 0) {
            symbol.code.name = symbol.code.name.slice('exports.'.length);
        }
    }
};
