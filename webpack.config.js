const fs = require('fs');
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');

// defines where the bundle file will live
const bundlePath = path.resolve(__dirname, "dist/");

module.exports = (_env, argv) => {
  let entryPoints = {
    Panel: {
      path: ["./src/Panel.tsx", "materialize-loader!./materialize.config.js"],
      outputHtml: "panel.html",
      build: true
    },
    LiveConfig: {
      path: ["./src/LiveConfig.tsx", "materialize-loader!./materialize.config.js"],
      outputHtml: "live_config.html",
      build: true
    },
    Config: {
      path: ["./src/Config.tsx", "materialize-loader!./materialize.config.js"],
      outputHtml: "config.html",
      build: true
    },
  };

  let entry = {};

  // edit webpack plugins here!
  let plugins = [
    new webpack.HotModuleReplacementPlugin(),
  ];

  for (name in entryPoints) {
    if (entryPoints[name].build) {
      entry[name] = entryPoints[name].path;
      if (argv.mode === 'production') {
        plugins.push(new HtmlWebpackPlugin({
          inject: true,
          chunks: [name],
          template: './template.html',
          filename: entryPoints[name].outputHtml
        }))
      }
    }
  }

  let config = {
    //entry points for webpack- remove if not used/needed
    entry,
    devtool: 'inline-source-map',
    optimization: {
      minimize: false // neccessary to pass Twitch's review process
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          loader: 'ts-loader',
        },
        {
          test: /\.scss$/,
          use: [
            { loader: "style-loader" },
            { loader: "css-loader" },
            { loader: "sass-loader" }
          ]
        },
        {
          test: /\.css$/,
          use: [
            { loader: "style-loader" },
            { loader: "css-loader" }
          ]
        },
        {
          test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'url-loader?limit=10000&mimetype=application/font-woff'
        },
        {
          test: /\.(jpe?g|png|gif|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'file-loader',
        }
      ]
    },
    resolve: {extensions: ['*', '.js', '.jsx', '.ts', '.tsx']},
    output: {
      filename: "[name].bundle.js",
      path: bundlePath
    },
    plugins
  };

  if (argv.mode === 'development') {
    config.devServer = {
      contentBase: path.join(__dirname, 'public'),
      host: argv.devrig ? 'localhost.rig.twitch.tv' : 'localhost',
      https: {
        key: fs.readFileSync(path.resolve(__dirname, 'conf/server.key')),
        cert: fs.readFileSync(path.resolve(__dirname, 'conf/server.crt'))
      },
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      port: 8080
    }
  }

  return config;
};
