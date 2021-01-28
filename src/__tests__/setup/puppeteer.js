import Chrome from 'puppeteer';

// Launch the browser
// Add `browser` and `page` to context
export async function setup(context) {
	context.browser = await Chrome.launch({headless: true});
	context.page = await context.browser.newPage();
	await context.page.goto('http://localhost:8080');
}

// Close everything on suite completion
export async function reset(context) {
	await context.page.close();
	await context.browser.close();
}

// Navigate to homepage
export async function homepage(context) {
	await context.page.goto('http://localhost:8080');
}
