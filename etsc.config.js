const { lodashOptimizeImports } = require("@optimize-lodash/esbuild-plugin");


module.exports = {
    // Supports all esbuild.build options
    esbuild: {
        bundle: true,
        sourcemap: 'inline',
        plugins: [lodashOptimizeImports()]
    },
    tsConfigFile: "tsconfig.base.json",
    // Prebuild hook
    prebuild: async () => {
        console.log("prebuild..");
        const rimraf = (await import("rimraf")).default;
        rimraf.sync("./dist"); // clean up dist folder
        console.log("prebuild - done");
    }
}