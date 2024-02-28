// Your addon is configured in addon.ts file or in environment variables. 
import addon from './addon';

// Import all routers and include them in start method call
import addonRouter from './addon.router';
import webhookRouter from './webhook.router';

void addon.start([addonRouter, webhookRouter]);

