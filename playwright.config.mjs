import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./browser',workers:1,fullyParallel:false,reporter:'list',
  use:{baseURL:'http://127.0.0.1:3101',launchOptions:{executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']},screenshot:'only-on-failure'},
  webServer:{command:'node browser/fixture-server.mjs',url:'http://127.0.0.1:3101/api/status',reuseExistingServer:false},
  projects:[{name:'desktop',use:{viewport:{width:1440,height:1000}}},{name:'mobile',use:{viewport:{width:390,height:844},isMobile:true,hasTouch:true}}]
});
