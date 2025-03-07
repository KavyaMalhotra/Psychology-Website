import 'dotenv/config'; // Loads environment variables from .env
import express from 'express';
import pkg from 'pg';
import bodyParser from 'body-parser';
import { addToGoogleSheets } from './googleSheets.js';

const { Pool } = pkg;

const app = express();
const port = 3000;

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Route to display table
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM questions ORDER BY id');
    res.render('index', { questions: result.rows });
  } catch (err) {
    console.error(err);
    res.send("Error retrieving data");
  }
});

// Route to update multiple marks at once
app.post('/update-all', async (req, res) => {
  try {
    const { ids, marks } = req.body;

    if (!Array.isArray(ids) || !Array.isArray(marks)) {
      return res.send("Invalid data format");
    }

    // List of IDs where marks should be calculated as (6 - entered marks)
    const negativeSignIds = new Set([
      17, 31, 49, 2, 18, 32, 50, 
      3, 26, 33, 45, 57, 64, 
      23, 30, 65, 68, 
      12, 20, 34, 40, 58, 
      35, 41, 53, 
      6, 15, 29
    ]);

    // Prepare update queries
    const updates = ids.map((id, index) => {
      let mark = parseInt(marks[index], 10);
      let questionId = parseInt(id, 10);

      // If the ID is in the negativeSignIds list, use (6 - mark)
      if (negativeSignIds.has(questionId)) {
        mark = 6 - mark;
      }

      return pool.query('UPDATE questions SET marks = $1 WHERE id = $2', [mark, questionId]);
    });

    // Execute all updates
    await Promise.all(updates);

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.send("Error updating data");
  }
});



// Function to determine category based on label and total marks
const categorizeMarks = (label, total) => {
  const ranges = {
    'coh': { low: 45, average: 60 },
    'exp': { low: 27, average: 39 },
    'conf': { high: 37, average: 51 },
    'A/C': { low: 40, average: 54 },
    'ind': { low: 30, average: 40 },
    'ARO': { low: 25, average: 33 },
    'org': { low: 6, average: 9 },
    'ctrl': { low: 13, average: 17 }
  };

  if (!ranges[label]) return '';

  if (label === 'conf') {
    if (total >= ranges[label].low) return 'low';
    if (total >= ranges[label].high) return 'average';
    return 'high';
  } else {
    if (total <= ranges[label].low) return 'low';
    if (total <= ranges[label].average) return 'average';
    return 'high';
  }
};

// Route to calculate total marks by label and determine categories
app.get('/totals', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT label, SUM(marks) AS total_marks FROM questions GROUP BY label'
    );

    const categorizedTotals = result.rows.map(row => ({
      label: row.label,
      total_marks: row.total_marks || 0,
      category: categorizeMarks(row.label, row.total_marks || 0)
    }));

    res.render('totals', { totals: categorizedTotals });
  } catch (err) {
    console.error(err);
    res.send("Error calculating totals");
  }
});

app.post('/add-to-sheet', async (req, res) => {
  try {
      console.log("Received Data:", req.body); // Debugging

      // Parse totals if it's a string
      let totals = req.body.totals;
      if (typeof totals === "string") {
          totals = JSON.parse(totals);
      }

      // Ensure totals is an array
      if (!Array.isArray(totals)) {
          console.error("Error: totals is not an array", totals);
          return res.status(400).send(`<script>alert("Invalid data format"); window.location.href="/index";</script>`);
      }

      // Transform totals array into an object matching the sheet columns
      const rowData = {
          coh: totals.find(t => t.label === 'coh')?.total_marks || '',
          exp: totals.find(t => t.label === 'exp')?.total_marks || '',
          conf: totals.find(t => t.label === 'conf')?.total_marks || '',
          ac: totals.find(t => t.label === 'A/C')?.total_marks || '',
          ind: totals.find(t => t.label === 'ind')?.total_marks || '',
          aro: totals.find(t => t.label === 'ARO')?.total_marks || '',
          org: totals.find(t => t.label === 'org')?.total_marks || '',
          ctrl: totals.find(t => t.label === 'ctrl')?.total_marks || '',
          coping: Array.isArray(req.body.coping) ? req.body.coping.join(", ") : req.body.coping
      };

      console.log("Row Data to be added:", rowData); // Debugging

      // Call the addToGoogleSheets function to add the data
      await addToGoogleSheets(rowData);

      // Redirect back to the index page after successful insertion
      res.redirect('/');

  } catch (error) {
      console.error('Error adding data to sheet:', error);
      res.status(500).send(`<script>alert("❌ Failed to add data"); window.location.href="/index";</script>`);
  }
});






// Start server
// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
