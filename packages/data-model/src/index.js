'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.PrismaClient = exports.db = void 0;
// Export Prisma client
const client_1 = require('./client');
Object.defineProperty(exports, 'db', {
  enumerable: true,
  get () {
    return client_1.db;
  },
});
// Re-export Prisma client for direct usage
const client_2 = require('../node_modules/.prisma/client');
Object.defineProperty(exports, 'PrismaClient', {
  enumerable: true,
  get () {
    return client_2.PrismaClient;
  },
});
//# sourceMappingURL=index.js.map
