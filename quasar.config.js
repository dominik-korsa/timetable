/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js

/* eslint-disable @typescript-eslint/no-var-requires */

/* eslint func-names: 0 */
/* eslint global-require: 0 */

require('dotenv').config();
const { configure } = require('quasar/wrappers');
const { Temporal } = require('@js-temporal/polyfill');

function requireEnv(key) {
  if (!process.env[key]) throw new Error(`Env variable "${key}" not set`);
  return process.env[key];
}

module.exports = configure((ctx) => ({
  // https://v2.quasar.dev/quasar-cli-webpack/supporting-ts
  supportTS: {
    tsCheckerConfig: {
      eslint: {
        enabled: true,
        files: './src/**/*.{ts,tsx,js,jsx,vue}',
      },
    },
  },

  // https://v2.quasar.dev/quasar-cli-webpack/prefetch-feature
  // preFetch: true,

  // app boot file (/src/boot)
  // --> boot files are part of "main.js"
  // https://v2.quasar.dev/quasar-cli-webpack/boot-files
  boot: [
    'install-prompt',
  ],

  // https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-css
  css: [
    'app.scss',
  ],

  // https://github.com/quasarframework/quasar/tree/dev/extras
  extras: [
    // 'ionicons-v4',
    // 'mdi-v5',
    // 'fontawesome-v6',
    // 'eva-icons',
    // 'themify',
    // 'line-awesome',
    'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

    // 'roboto-font', // optional, you are not bound to it
    'material-icons', // optional, you are not bound to it
    'material-icons-outlined',
  ],

  // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-build
  build: {
    vueRouterMode: 'history', // available values: 'hash', 'history'

    // transpile: false,
    publicPath: '/',

    // Add dependencies for transpiling with Babel (Array of string/regex)
    // (from node_modules, which are by default not transpiled).
    // Applies only if "transpile" is set to true.
    // transpileDependencies: [],

    // rtl: true, // https://quasar.dev/options/rtl-support
    // preloadChunks: true,
    // showProgress: false,
    // gzip: true,
    // analyze: true,

    // Options below are automatically set depending on the env, set them if you want to override
    // extractCSS: false,

    // https://v2.quasar.dev/quasar-cli-webpack/handling-webpack
    // "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain
    // chainWebpack (/* chain */) {}
    env: {
      PROXY_URL: requireEnv('PROXY_URL'),
      VLO_V1_API_ORIGIN: process.env.VLO_V1_API_ORIGIN,
      VLO_V2_API_ORIGIN: process.env.VLO_V2_API_ORIGIN,
      WEB_PUSH_BACKEND_ORIGIN: requireEnv('WEB_PUSH_BACKEND_ORIGIN'),
      WEB_PUSH_VAPID_PUBLIC_KEY: requireEnv('WEB_PUSH_VAPID_PUBLIC_KEY'),
      MAPTILER_API_KEY: requireEnv('MAPTILER_API_KEY'),
      BRANCH: process.env.BRANCH,
      DEPLOY_ID: process.env.DEPLOY_ID,
      REPOSITORY_URL: process.env.REPOSITORY_URL,
      COMMIT_REF: process.env.COMMIT_REF,
      SITE_NAME: process.env.SITE_NAME,
      BUILD_TIME: Temporal.Now.instant().toString(),
    },
  },

  // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-devServer
  devServer: {
    server: {
      type: 'http',
    },
    port: 8080,
    open: false, // opens browser window automatically
  },

  // https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-framework
  framework: {
    config: {},

    // iconSet: 'material-icons', // Quasar icon set
    lang: 'pl',

    // For special cases outside of where the auto-import strategy can have an impact
    // (like functional components as one of the examples),
    // you can manually specify Quasar components/directives to be available everywhere:
    //
    // components: [],
    // directives: [],

    // Quasar plugins
    plugins: ['Notify', 'Dialog'],
  },

  // animations: 'all', // --- includes all animations
  // https://quasar.dev/options/animations
  animations: [],

  // https://v2.quasar.dev/quasar-cli-webpack/developing-ssr/configuring-ssr
  ssr: {
    pwa: false,

    // manualStoreHydration: true,
    // manualPostHydrationTrigger: true,

    prodPort: 3000, // The default port that the production server should use
    // (gets superseded if process.env.PORT is specified at runtime)

    maxAge: 1000 * 60 * 60 * 24 * 30,
    // Tell browser when a file from the server should expire from cache (in ms)

    // chainWebpackWebserver (/* chain */) {},

    middlewares: [
      ctx.prod ? 'compression' : '',
      'render', // keep this as last one
    ],
  },

  // https://v2.quasar.dev/quasar-cli-webpack/developing-pwa/configuring-pwa
  pwa: {
    workboxPluginMode: 'InjectManifest', // 'GenerateSW' or 'InjectManifest'
    workboxOptions: {},

    // for the custom service worker ONLY (/src-pwa/custom-service-worker.[js|ts])
    // if using workbox in InjectManifest mode
    // chainWebpackCustomSW (/* chain */) {},

    manifest: {
      name: 'Plan lekcji',
      short_name: 'Plan lekcji',
      description: 'Aplikacja do wyświetlania planów lekcji OPTIVUM i planu V LO w Krakowie',
      display: 'standalone',
      orientation: 'any',
      background_color: '#ffffff',
      theme_color: '#027be3',
      start_url: 'pwa-home',
      icons: [
        {
          src: 'icons/icon-128x128.png',
          sizes: '128x128',
          type: 'image/png',
        },
        {
          src: 'icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'icons/icon-256x256.png',
          sizes: '256x256',
          type: 'image/png',
        },
        {
          src: 'icons/icon-384x384.png',
          sizes: '384x384',
          type: 'image/png',
        },
        {
          src: 'icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
  },

  // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/developing-cordova-apps/configuring-cordova
  cordova: {
    // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
  },

  // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/developing-capacitor-apps/configuring-capacitor
  capacitor: {
    hideSplashscreen: true,
  },

  // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/developing-electron-apps/configuring-electron
  electron: {
    bundler: 'packager', // 'packager' or 'builder'

    packager: {
      // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

      // OS X / Mac App Store
      // appBundleId: '',
      // appCategoryType: '',
      // osxSign: '',
      // protocol: 'myapp://path',

      // Windows only
      // win32metadata: { ... }
    },

    builder: {
      // https://www.electron.build/configuration/configuration

      appId: 'timetable',
    },

    // "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain
    chainWebpackMain(/* chain */) {
      // do something with the Electron main process Webpack cfg
      // extendWebpackMain also available besides this chainWebpackMain
    },

    // "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain
    chainWebpackPreload(/* chain */) {
      // do something with the Electron main process Webpack cfg
      // extendWebpackPreload also available besides this chainWebpackPreload
    },
  },
}));
