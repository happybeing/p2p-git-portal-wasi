import { test } from 'uvu';
import * as assert from 'uvu/assert';
import * as ENV from './setup/puppeteer.js';

test.before(async (context) => { 
  await ENV.serversUp();
  await ENV.setup(context); 
});

test.after(async (context) => { 
  await ENV.reset(context); 
  await ENV.serversDown();  
});

// test('can access application', async context => {
//   let w = await context.page.evaluate(async () => {
//     return window;
//   });
//   console.log('typeof(w):' + typeof(w));
//   assert.type(w, 'object');
//   // TODO more asserts
// });

test('can access API', async context => {
  // console.log('t1');
  let api = await context.page.evaluate(async () => {
    return window.__API__;
  });
  assert.type(api, 'object');
  // TODO more asserts
});

test('can list directory', async context => {
  // console.log('t2');
  let directory = await context.page.evaluate(async () => {
      return window.__API__.getDirectory('/');
  });
  assert.type(directory, 'object');
  // TODO more asserts
  });
  
test('can list directory', async context => {
  // console.log('t3');
  let directory = await context.page.evaluate(async () => {
      return window.__API__.getDirectory('/');
  });
  assert.type(directory, 'object');
  // TODO more asserts
  });

test.run();
