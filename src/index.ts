import 'dotenv/config';
import express, { Request, Response } from 'express';
import { KitsasService } from 'kitsas-library';
import session from 'express-session';
import addonRoutes from './addon';
import webhookRoutes from './webhook';
import { health } from './library';
import { config } from './config';
import morgan from 'morgan';

const app = express();

app.locals.config = config;
app.set('view engine', 'pug');
app.use(session({
    secret: config.SESSION_SECRET,
    resave: false,  
    saveUninitialized: false,  
}));
app.use(morgan('combined'));

app.get('/', (req: Request, res: Response) => {
  res.redirect('addon' + req.url);
});

app.use(express.json());
app.use('/static', express.static('public'));
app.use('/webhook', webhookRoutes);
app.use('/health', health);

app.use('/addon', addonRoutes);


async function main() {
    try {
        const connection = await KitsasService.connect({});
        app.set('KitsasConnection', connection);
        
        app.listen(config.PORT, () => {
            console.log(`${config.appName} running on port ${config.PORT}. Connected as ${connection.getName()}.`);
        });
    } catch (error) {
        console.error('Failed to connect to Kitsas ', (error as Error).message);
    }
}

void main();

