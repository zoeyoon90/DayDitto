import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'dayditto',
  brand: {
    primaryColor: '#e78e23',
  },
  permissions: [],
  webBundleDir: 'dist',
  webView: {
    bounces: false,
    pullToRefreshEnabled: true,
  },
});
