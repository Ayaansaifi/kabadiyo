import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kabadiwala.app',
  appName: 'Kabadiwala',
  webDir: 'public',
  server: {
    url: 'http://10.107.4.187:3000',
    cleartext: true
  }
};

export default config;
