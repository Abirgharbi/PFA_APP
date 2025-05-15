import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'medical',
  webDir: 'dist',
  server: {
    cleartext: true,
    url: "http://172.20.10.6:8080/",}
};

export default config;
