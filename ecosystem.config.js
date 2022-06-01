module.exports = {
  apps: [
      {
        name: 'filenode',
        script: 'app.js',
        watch: false,
        env: {
          'NODE_ENV': 'pre',
        }
      }
  ]
}