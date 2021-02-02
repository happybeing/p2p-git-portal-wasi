import Chrome from 'puppeteer';
import * as CONFIG from './config.js';

import buildserver from './buildserver.cjs';
import devserver from './devserver.cjs';
import gitserver from './githttpserver.cjs';
let appserver; // Will be buildserver or devserver depending on CONFIG.mode

const mode = CONFIG.mode || 'production';
if (mode === 'production') {
  console.log("TESTING ON BUILD");
} else if (mode === 'development') {
  console.log("TESTING USING DEV SERVER");
} else {
  throw new Error("Unexpected test CONFIG.mode:" + CONFIG.mode);
}

export async function serversUp(){
	if (mode === 'production') {
		appserver = buildserver;
		await appserver.startServer(5111);
		await gitserver.startServer(5222);
	} else if (mode === 'development') {
		appserver = devserver;
		await appserver.startServer(5111);
		await gitserver.startServer(5222);
	}
}

export async function serversDown() {
	await appserver.shutdownServer();
	await gitserver.shutdownServer();
}
    
// Launch the browser
// Add `browser` and `page` to context
export async function setup(context) {
	console.log('puppeteer setup()');
	context.browser = await Chrome.launch({headless: true});
	context.page = await context.browser.newPage();
	await context.page.goto('http://localhost:5111');
}

// Close everything on suite completion
export async function reset(context) {
	console.log('puppeteer reset()');
	if (context && context.page) await context.page.close();
	if (context && context.browser) await context.browser.close();
}
