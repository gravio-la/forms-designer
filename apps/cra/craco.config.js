const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Allow imports from the workspace root node_modules
      webpackConfig.resolve.modules = [
        ...webpackConfig.resolve.modules,
        path.resolve(__dirname, '../../node_modules'),
      ];
      
      // Add alias for react-refresh to point to the workspace root
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        'react-refresh': path.resolve(__dirname, '../../node_modules/react-refresh'),
      };
      
      // Disable the ModuleScopePlugin to allow imports from outside src/
      const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
      webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
        plugin => !(plugin instanceof ModuleScopePlugin)
      );
      
      return webpackConfig;
    },
  },
};
