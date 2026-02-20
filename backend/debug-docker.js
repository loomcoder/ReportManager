
const { CubejsServerCore } = require('@cubejs-backend/server-core');
const core = new CubejsServerCore({ schemaPath: '/app/schema' });
console.log('INSTANCE KEYS:', Object.keys(core));
console.log('PROTOTYPE KEYS:', Object.getOwnPropertyNames(Object.getPrototypeOf(core)));
