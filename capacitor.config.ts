import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kabadiwala.app',
  appName: 'Kabadiwala',
  webDir: 'out',
  server: {
    // Use your Vercel URL for production
    url: 'https://kabadiyo.vercel.app',
    cleartext: true
  }
};

export default config;

