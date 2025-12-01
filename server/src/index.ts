import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Cert-Watcher API is running');
});

import { analyzeCertificateChain } from './cert-analyzer';

app.get('/api/analyze', async (req, res) => {
    const { domain } = req.query;

    if (!domain || typeof domain !== 'string') {
        res.status(400).json({ error: 'Domain is required' });
        return;
    }

    try {
        const chain = await analyzeCertificateChain(domain);
        res.json(chain);
    } catch (error: any) {
        console.error('Error analyzing domain:', error);
        res.status(500).json({ error: error.message || 'Failed to analyze certificate' });
    }
});

import cron from 'node-cron';

// Mock Alerting System
cron.schedule('0 9 * * *', () => { // Run every day at 9 AM
    console.log('Running daily certificate expiry check...');
    // In a real app, we would iterate over stored domains.
    // Here we just simulate a check for a demo domain.
    const demoDomain = 'google.com';
    analyzeCertificateChain(demoDomain).then(chain => {
        if (chain.daysRemaining < 30) {
            console.log(`[ALERT] Certificate for ${demoDomain} expires in ${chain.daysRemaining} days! Sending email...`);
        } else {
            console.log(`[INFO] Certificate for ${demoDomain} is valid for ${chain.daysRemaining} days.`);
        }
    }).catch(err => {
        console.error(`[ERROR] Failed to check ${demoDomain}:`, err.message);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
