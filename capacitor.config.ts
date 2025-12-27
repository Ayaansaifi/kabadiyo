import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kabadiwala.app',
  appName: 'Kabadiyo',
  webDir: 'out',
  server: {
    // Use your Vercel URL for production
    url: 'https://kabadiyo.com',
    cleartext: true
  }
};

export default config;

