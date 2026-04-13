const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  pwa: {
    name: 'TypeMate',
    themeColor: '#0B1120',
    msTileColor: '#0B1120',
    iconPaths: {
      faviconSVG: 'img/icons/favicon-dark.svg',
      favicon32: null,
      favicon16: null,
      appleTouchIcon: 'img/icons/apple-touch-icon.png',
      maskIcon: 'img/icons/safari-pinned-tab.svg',
      msTileImage: 'img/icons/msapplication-icon-144x144.png'
    }
  },
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = 'TypeMate'
        return args
      })
  }
})
