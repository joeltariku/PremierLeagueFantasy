import app from './app.js';
import {PORT} from './utils/config.js'

app.listen(PORT, () => {
  console.log(`Proxy backend running on http://localhost:${PORT}`);
});
