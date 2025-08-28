const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting to prevent API abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000'
}));
app.use(express.json({ limit: '10mb' }));
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Summary generation endpoint
app.post('/api/generate-summary', async (req, res) => {
  try {
    const { projectName, entries } = req.body;

    // Validation
    if (!projectName || !entries || !Array.isArray(entries)) {
      return res.status(400).json({
        error: 'Invalid request. Expected projectName and entries array.'
      });
    }

    if (entries.length === 0) {
      return res.status(400).json({
        error: 'No entries provided for summarization.'
      });
    }

    // Validate entries structure
    for (const entry of entries) {
      if (!entry.date || !entry.reflection) {
        return res.status(400).json({
          error: 'Invalid entry format. Each entry must have date and reflection.'
        });
      }
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not configured');
      return res.status(500).json({
        error: 'Summary service temporarily unavailable.'
      });
    }

    // Prepare entries for Claude API
    const entriesText = entries
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((entry, index) => `Day ${index + 1} (${entry.date}): ${entry.reflection}`)
      .join('\n\n');

    const prompt = `Here are the daily entries for a creative project called "${projectName}":

${entriesText}

Please write exactly 1 sentence that summarizes this project. The tone should be encouraging and supportive but neutral - not like it's coming from a person. Focus on what the project is about, what has been learned or accomplished, and where it seems to be headed. Use "you" to address the creator directly, but avoid phrases like "I love how" or "I can see" - keep it observational and encouraging without personal commentary.`;

    // Call Claude API
    console.log(`Generating summary for project: ${projectName} (${entries.length} entries)`);
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 100,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', response.status, errorData);
      
      if (response.status === 429) {
        return res.status(429).json({
          error: 'Rate limit exceeded. Please try again later.'
        });
      }
      
      return res.status(500).json({
        error: 'Failed to generate summary. Please try again later.'
      });
    }

    const data = await response.json();
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('Invalid Claude API response format:', data);
      return res.status(500).json({
        error: 'Invalid response from summary service.'
      });
    }

    const summary = data.content[0].text.trim();
    console.log(`Summary generated successfully for project: ${projectName}`);

    res.json({
      summary,
      projectName,
      entryCount: entries.length,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({
      error: 'Internal server error. Please try again later.'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Forms backend server running on port ${PORT}`);
  console.log(`🌐 Accepting requests from: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  console.log(`🔑 API Key configured: ${!!process.env.ANTHROPIC_API_KEY}`);
});

module.exports = app;