import { SERVER_PORT, PATHS } from "./webpack.config.babel";

export const webpackDevServer = (DEV = false) => {
  return {
    ...(DEV
      ? {
          devServer: {
            port: SERVER_PORT,
            hot: true,
            contentBase: PATHS.dist,
            publicPath: `http://localhost:${SERVER_PORT}/`,
            headers: {
              "Access-Control-Allow-Origin": `*`
            },
            stats: {
              colors: true
            }
          }
        }
      : {})
  };
};
