const express = require('express');
const cors = require('cors');

const analyzeRoute = require('./routes/analyzeRoute');
const downloadRoute = require('./routes/downloadRoute');
const screenshotRoute = require('./routes/screenshotRoute');
const fontsRoute = require('./routes/fontsRoute');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS — restrict to known origins in production.
// Set ALLOWED_ORIGINS on Railway to your Vercel URL (comma-separated).
// Example: https://your-project.vercel.app
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests (no Origin header) and known origins
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/analyze', analyzeRoute);
app.use('/api/download', downloadRoute);
app.use('/api/screenshot', screenshotRoute);
app.use('/api/fonts', fontsRoute);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Bind to 0.0.0.0 so Railway/Docker can route traffic to the container
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
