import app from './app.ts';
import {PORT} from './utils/config.js'

app.listen(PORT, () => {
  console.log(`Proxy backend running on http://localhost:${PORT}`);
});
