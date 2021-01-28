import * as __API__ from './api'
window.__API__ = __API__	// For test harness

import App from './App.svelte';

const init = async() => {

	const app = new App({
		target: document.body,
		props: {
		}
	});
};

init();