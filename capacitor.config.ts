
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.54d4e4ead01a4ec4b1cfab646333d752',
  appName: 'medi-report-archive-hub',
  webDir: 'dist',
  server: {
    url: 'https://54d4e4ea-d01a-4ec4-b1cf-ab646333d752.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
    },
  },
};

export default config;
