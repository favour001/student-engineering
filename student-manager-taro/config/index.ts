import { defineConfig } from '@tarojs/cli'
import path from 'path'

export default defineConfig(async (merge) => {
  const baseConfig = {
    projectName: 'student-manager-taro',
    date: '2026-04-27',
    designWidth: 390,
    deviceRatio: {
      390: 2,
      375: 2,
      750: 1,
      828: 1.81
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    framework: 'react',
    compiler: 'webpack5',
    defineConstants: {
      __API_ORIGIN__: JSON.stringify(process.env.TARO_APP_API_ORIGIN || 'http://127.0.0.1:8888'),
      __API_PREFIX__: JSON.stringify(process.env.TARO_APP_API_PREFIX || '/api'),
      __ASSET_ORIGIN__: JSON.stringify(process.env.TARO_APP_ASSET_ORIGIN || 'https://sdsosa.com')
    },
    alias: {
      '@': path.resolve(__dirname, '..', 'src')
    },
    sass: {
      resource: ['src/styles/variables.scss']
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {}
        },
        cssModules: {
          enable: false,
          config: {}
        }
      }
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      router: {
        mode: 'browser'
      },
      devServer: {
        host: '127.0.0.1',
        port: 10086,
        allowedHosts: 'all',
        historyApiFallback: true
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {}
        },
        cssModules: {
          enable: false,
          config: {}
        }
      }
    }
  }

  if (process.env.NODE_ENV === 'development') {
    return merge({}, baseConfig, {})
  }

  return merge({}, baseConfig, {})
})
