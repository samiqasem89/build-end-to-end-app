const { test, expect } = require('@playwright/test');

let pageErrors;
let externalRequests;

test.beforeEach(async ({ page }) => {
    pageErrors = [];
    externalRequests = [];

    page.on('pageerror', error => {
        pageErrors.push(error.message);
    });

    await page.route('**/*', async route => {
        const url = new URL(route.request().url());

        if (url.origin === 'http://127.0.0.1:8080') {
            await route.continue();
            return;
        }

        // Isolate these tests from the external map service.
        if (
            url.hostname === 'js.arcgis.com' &&
            route.request().resourceType() === 'script'
        ) {
            await route.fulfill({
                status: 200,
                contentType: 'application/javascript',
                body: 'window.require = function () {};'
            });
            return;
        }

        // Record unexpected external API calls and block them.
        if (
            ['fetch', 'xhr'].includes(
                route.request().resourceType()
            )
        ) {
            externalRequests.push(route.request().url());
        }

        await route.abort();
    });
});

test.afterEach(async () => {
    expect(pageErrors).toEqual([]);
    expect(externalRequests).toEqual([]);
});

const forms = [
    {
        name: 'sign-in',
        path: '/signin.html',
        selector: '#signinForm'
    },
    {
        name: 'registration',
        path: '/register.html',
        selector: '#registrationForm'
    },
    {
        name: 'email verification',
        path: '/verify.html',
        selector: '#verifyForm'
    }
];

for (const form of forms) {
    test(`${form.name} is disabled without AWS configuration`, async ({
        page
    }) => {
        await page.goto(form.path);

        await expect(page.locator('#authMessage')).toContainText(
            'not connected to an AWS deployment'
        );

        const controls = page.locator(
            `${form.selector} input, ${form.selector} button`
        );

        expect(await controls.count()).toBeGreaterThan(0);

        for (const control of await controls.all()) {
            await expect(control).toBeDisabled();
        }

        // Confirm the submit handler cancels submission.
        const submissionPrevented = await page
            .locator(form.selector)
            .evaluate(element => {
                const event = new Event('submit', {
                    bubbles: true,
                    cancelable: true
                });

                return !element.dispatchEvent(event);
            });

        expect(submissionPrevented).toBe(true);
        await expect(page).toHaveURL(
            new RegExp(`${form.path.replace('.', '\\.')}$`)
        );
    });
}

test('ride requests are disabled without an API', async ({ page }) => {
    await page.goto('/ride.html');

    await expect(page.locator('#request')).toBeDisabled();

    await expect(page.locator('#updates')).toContainText(
        'not connected to a deployed API'
    );

    await expect(page.locator('#authTokenModal')).toHaveCount(0);
    await expect(page.locator('.authToken')).toHaveCount(0);
});

test('sign-out works when there is no configured user pool', async ({
    page
}) => {
    await page.goto('/ride.html');

    await expect(page.locator('#authMessage')).toContainText(
        'not connected to an AWS deployment'
    );

    // The dropdown's external stylesheet is blocked in this
    // isolated test, so dispatch the click directly.
    await page.locator('#signOut').dispatchEvent('click');

    await expect(page).toHaveURL(/\/signin\.html$/);

    await expect(
        page.locator('#signinForm input[type="submit"]')
    ).toBeDisabled();
});
