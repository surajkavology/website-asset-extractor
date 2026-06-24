const express = require('express');
const cors = require('cors');

const analyzeRoute = require('./routes/analyzeRoute');
const downloadRoute = require('./routes/downloadRoute');
const screenshotRoute = require('./routes/screenshotRoute');
const fontsRoute = require('./routes/fontsRoute');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/analyze', analyzeRoute);
app.use('/api/download', downloadRoute);
app.use('/api/screenshot', screenshotRoute);
app.use('/api/fonts', fontsRoute);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
