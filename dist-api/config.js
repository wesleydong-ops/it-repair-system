"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
var path_1 = require("path");
var getConfig = function () {
    var nodeEnv = process.env.NODE_ENV || 'development';
    return {
        httpPort: parseInt(process.env.HTTP_PORT || '8080', 10),
        httpsPort: parseInt(process.env.HTTPS_PORT || (nodeEnv === 'production' ? '4433' : '8443'), 10),
        staticPath: process.env.STATIC_PATH || path_1.default.join(__dirname, '../dist'),
        certPath: process.env.CERT_PATH || path_1.default.join(__dirname, '../certs'),
        dataPath: process.env.DATA_PATH || path_1.default.join(__dirname, '../data'),
        jwtSecret: process.env.JWT_SECRET || 'your-secret-key-here',
        nodeEnv: nodeEnv
    };
};
exports.config = getConfig();
