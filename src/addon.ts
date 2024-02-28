// You can configure your addon via option object
// or environment variables. See
// (Addon Library documentation)[https://kitsas-oy.github.io/kitsasaddonlibrary/interfaces/AddonOptions.html]
// for more information.
import { KitsasAddon } from 'kitsas-addon-library';
const addon = new KitsasAddon({
    appName: 'Addon Template',
    port: 4774,
});

export default addon;