const glob = require('glob')

function getEntry(url) {
  let entrys = {}
  glob.sync(url).forEach(item => {
    let urlArr = item.split('/').splice(-3)
    entrys[urlArr[1]] = {
      entry: 'src/pages/' + urlArr[1] + '/' + 'index.js',
      template: 'src/pages/' + urlArr[1] + '/' + 'index.html',
      filename: urlArr[1] + '.html',
      title: 'pages-' + urlArr[1]
    }
  })
  return entrys
}
let pages = getEntry('./src/pages/**?/*.html')
module.exports = {
  pages: pages,
  devServer: {
    index: '/backstage.html', // 默认首页
    open: true
  },
  configureWebpack: {
    devtool: 'source-map'
  }
}
