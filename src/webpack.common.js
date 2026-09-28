const path = require('path');

module.exports = {
  entry: {
    app: './js/fanfirst.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: './js/fanfirst.js',
  },
};
