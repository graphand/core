module.exports = function () {
  return {
    name: "@graphand/core",
    testFramework: {
      configFile: "./jest.config.js",
    },
    runMode: "onsave",
  };
};
