const express = require('express');
require('dotenv').config();

// Use Node.js built-in fetch (available in Node 18+)
const { fetch } = globalThis;

const app = express();
app.use(express.json());
app.use(express.static('public'));

const { SN_INSTANCE, SN_USERNAME, SN_PASSWORD } = process.env;

if (!SN_INSTANCE || !SN_USERNAME || !SN_PASSWORD) {
  console.error("❌ Missing ServiceNow environment variables. Check your .env file.");
  process.exit(1);
}

app.post('/api/incidents', async (req, res) => {
  try {
    const url = `https://${SN_INSTANCE}.service-now.com/api/now/table/incident`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${SN_USERNAME}:${SN_PASSWORD}`).toString('base64')
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ ServiceNow API error:`, data);
      return res.status(response.status).json(data);
    }

    res.json(data.result);
  } catch (err) {
    console.error("❌ Error creating incident:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
