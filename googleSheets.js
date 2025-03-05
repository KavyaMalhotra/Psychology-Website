import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import 'dotenv/config';
import fs from 'fs';

// Load credentials
const credentials = JSON.parse(fs.readFileSync(process.env.GOOGLE_SHEET_CREDENTIALS_PATH, 'utf8'));

// Google Sheets ID (Extract from URL)
const SPREADSHEET_ID = '12wOq9Q1NvHgKvW3mrEdVfGENGym96_37FdC5cura4Z4';

// Service account authentication
const auth = new JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Function to add data to Google Sheets
export async function addToGoogleSheets(data) {
  try {
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, auth);
    await doc.loadInfo(); // Load spreadsheet metadata

    const sheet = doc.sheetsByIndex[0]; // First sheet (Table1)

    // Append new row with data (no need to manually calculate the ID)
    await sheet.addRow({
      1: data.coh,
      2: data.exp,
      3: data.conf,
      4: data.ac,
      5: data.ind,
      6: data.aro,
      7: data.org,
      8: data.ctrl,
      Coping: data.coping
    });

    console.log(`✅ Data added to Google Sheets successfully!`);
  } catch (error) {
    console.error("❌ Error adding data to Google Sheets:", error);
  }
}
