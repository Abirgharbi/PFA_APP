import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'medicalo',
  webDir: 'dist',
  server: {
    cleartext: true,
    url: "http://192.168.1.17:8080/",}
};

export default config;
