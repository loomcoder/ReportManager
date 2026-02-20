
const { CubejsServerCore } = require('@cubejs-backend/server-core');
const core = new CubejsServerCore({ schemaPath: '/app/schema' });
core.compilerApi().metaConfig().then(m => console.log('META:', JSON.stringify(m))).catch(e => console.log('ERR:', e.message, e.stack));
