const { CubejsServerCore } = require('@cubejs-backend/server-core');
(async () => {
    try {
        const core = new CubejsServerCore({
            schemaPath: require('path').join(__dirname, 'schema'),
            dbType: 'sqlite',
            logger: (msg, params) => console.log(msg, params)
        });
        const compilerApi = core.compilerApi();
        const meta = await compilerApi.metaConfig();
        require('fs').writeFileSync('/home/himanshu/code/ReportManager/cube-debug.txt', JSON.stringify(meta, null, 2));
    } catch (e) {
        require('fs').writeFileSync('/home/himanshu/code/ReportManager/cube-debug.txt', "SCHEMA ERROR: " + e.message + "\n" + e.stack);
    } finally {
        process.exit(0);
    }
})();
