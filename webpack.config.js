const webpack = require("webpack");
const ejs = require("ejs");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtensionReloader = require("webpack-extension-reloader");
const { VueLoaderPlugin } = require("vue-loader");
const { version } = require("./package.json");

const config = {
    mode: process.env.NODE_ENV,
    context: __dirname + "/src",
    entry: {
        "config/const": "./config/const.js",
        main: "./main.js",
        background: "./background.js",
        "popup/popup": "./popup/popup.js",
        "options/options": "./options/options.js",
    },
    output: {
        path: __dirname + "/dist",
        filename: "[name].js",
    },
    resolve: {
        extensions: [".js", ".vue"],
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loaders: "vue-loader",
            },
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
            {
                test: /\.scss$/,
                use: [
                  MiniCssExtractPlugin.loader,
                  "css-loader",
                  { loader: "sass-loader", options: { implementation: require("sass") } }
                ],
            },
            {
                test: /\.sass$/,
                use: [
                  MiniCssExtractPlugin.loader,
                  "css-loader",
                  { loader: "sass-loader", options: { "indentedSyntax": true, implementation: require("sass") } }
                ],
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
                loader: "file-loader",
                options: {
                    name: "[name].[ext]",
                    outputPath: "/images/",
                    emitFile: false,
                },
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                loader: "file-loader",
                options: {
                    name: "[name].[ext]",
                    outputPath: "/fonts/",
                    emitFile: false,
                },
            },
            {
                test: /\.(mp3)$/,
                loader: "file-loader",
                options: {
                    name: "[name].[ext]",
                    outputPath: "/sounds/",
                    emitFile: false,
                },
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            global: "window",
        }),
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: "[name].css",
        }),
        new CopyWebpackPlugin([
            { from: "_locales", to: "_locales" },
            { from: "icons", to: "icons", ignore: ["icon.xcf"] },
            { from: "sounds", to: "sounds" },
            { from: "popup/popup.html", to: "popup/popup.html", transform: transformHtml },
            { from: "options/options.html", to: "options/options.html", transform: transformHtml },
            {
                from: "manifest.json",
                to: "manifest.json",
                transform: (content) => {
                    const jsonContent = JSON.parse(content);
                    jsonContent.version = version;

                    if (config.mode === "development") {
                        jsonContent["content_security_policy"] =
                            "script-src 'self' 'unsafe-eval'; object-src 'self'";
                    }

                    return JSON.stringify(jsonContent, null, 2);
                },
            },
        ]),
    ],
};

if (config.mode === "production") {
    config.plugins = (config.plugins || []).concat([
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: '"production"',
            },
        }),
    ]);
}

if (process.env.HMR === "true") {
    config.plugins = (config.plugins || []).concat([
        new ExtensionReloader({
            manifest: __dirname + "/src/manifest.json",
        }),
    ]);
}

const transformHtml = (content) => {
    return ejs.render(content.toString(), {
        ...process.env,
    });
};

module.exports = config;
