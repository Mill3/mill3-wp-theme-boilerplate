module.exports = (DEV = false, SERVER_PORT, PATHS) => {
  return {
    ...(DEV
      ? {
          devServer: {
            port: SERVER_PORT,
            compress: true,
            devMiddleware: {
              publicPath: `http://localhost:${SERVER_PORT}/`,
            },
            static: {
              publicPath: PATHS.dist,
            },
            client: {
              logging: "info",
              overlay: true,
              progress: true,
            },
            allowedHosts: 'all',
            headers: {
              "Access-Control-Allow-Origin": `*`
            }
          }
        }
      : {})
  };
};
