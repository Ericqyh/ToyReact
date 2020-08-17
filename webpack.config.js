module.exports = {
    mode: 'development',
    entry: {
        main: './main.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader'
            }
        ]
    },
    optimization: {
        minimize: false
    }
}