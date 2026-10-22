const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests',
    timeout: 30000,
    retries: 0,
    workers: 1,
    reporter: 'list',

    use: {
        baseURL: 'http://127.0.0.1:8080',
        browserName: 'chromium',
        headless: true,
        screenshot: 'only-on-failure'
    },

    webServer: {
        command: 'python3 -m http.server 8080 --bind 127.0.0.1 --directory ..',
        url: 'http://127.0.0.1:8080',
        reuseExistingServer: false,
        timeout: 30000
    }
});
