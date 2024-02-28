// Router for webhooks

import addon from './addon';
// The second parameter disables default middleware
const router = addon.createRouter('/webhook', false);

export default router;