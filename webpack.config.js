const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';
// console.log('INFO: mode is ' + mode);
module.exports = {
	// target: 'node',
	// node: {
	//   __dirname: false,
	//   __filename: false,
	// },
	// infrastructureLogging: {
	// 	level: 'verbose'
	// },
	entry: {
		bundle: [__dirname + '/src/main.js']
	},
	resolve: {
		alias: {
			svelte: path.resolve('node_modules', 'svelte')
		},
		extensions: ['.mjs', '.js', '.svelte'],
		mainFields: ['svelte', 'browser', 'module', 'main']
	},
	devServer: {
		contentBase: path.join(__dirname, 'public'),
		// contentBasePublicPath: '/',
		// contentBasePublicPath: '/',
		// contentBase: './public',
	  },
	output: {
		path: path.join(__dirname, 'public'),
		filename: '[name].js',
		chunkFilename: '[name].[id].js',
		publicPath: '/'
	},
	module: {
		rules: [
			{
				test: /\.svelte$/,
				use: {
					loader: 'svelte-loader',
					options: {
						emitCss: true,
						hotReload: true
					}
				}
			},
			{
				test: /\.css$/,
				use: [
					/**
					 * MiniCssExtractPlugin doesn't support HMR.
					 * For developing, use 'style-loader' instead.
					 * */
					prod ? MiniCssExtractPlugin.loader : 'style-loader',
					'css-loader'
				]
			}
		]
	},
	mode,
	plugins: [
		new MiniCssExtractPlugin({
			filename: '[name].css'
		}),
        // new HtmlWebpackPlugin({
		// 	title: 'Development',
		// 	}),
			// new HtmlWebpackPlugin({
		// 	filename: 'index.html',
		// 	template:  __dirname + '/public/index.html',
		// 	title: 'Test server'
		// 	})
	],
	devtool: prod ? false: 'source-map'
};
// console.log('INFO: webpackConfig.entry.bundle: ' + JSON.stringify(module.exports.entry.bundle));
// console.log('INFO: webpackConfig.output.path: ' + module.exports.output.path);
