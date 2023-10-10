import 'dotenv/config';
import express, { Request, Response } from 'express';
import { KitsasService } from 'kitsas-library';
import session from 'express-session';
import addonRoutes from './addon';
import webhookRoutes from './webhook';

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'pug');
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,  
    saveUninitialized: false,  
}));

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World');
});

app.use('/addon', addonRoutes);
app.use('/webhook', webhookRoutes);

async function main() {
    const connection = await KitsasService.connect({});
    console.log(`Connected as ${connection.getName()} `);
    app.set('KitsasConnection', connection);
    
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

void main();

