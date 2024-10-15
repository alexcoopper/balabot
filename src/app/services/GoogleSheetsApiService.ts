import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { sheets_v4 } from 'googleapis/build/src/apis/sheets';
import { DefaultColumnCount, GoogleSheetDateTimeFormat, Scopes, MainSheetName } from '../constants';
import { Expense, ExpenseType } from '../models';
import { format } from 'date-fns';

export class GoogleSheetsApiService {
    private sheets: sheets_v4.Sheets;
    private spreadsheetId: string;

    // Private constructor to prevent direct instantiation
    private constructor(sheets: sheets_v4.Sheets, spreadsheetId: string) {
        this.sheets = sheets;
        this.spreadsheetId = spreadsheetId;
    }

    // Static async factory method to create the instance
    public static async create(): Promise<GoogleSheetsApiService> {
        const spreadsheetId = process.env.SPREADSHEET_ID || '';
        const credentialsBase64 = process.env.GOOGLE_CREDENTIALS || '';
        const credentialsBuffer = Buffer.from(credentialsBase64, 'base64');
        const credentials = JSON.parse(credentialsBuffer.toString('utf-8'));
        
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: Scopes,
        });

        const authClient = (await auth.getClient()) as JWT;
        const sheets = google.sheets({
            version: 'v4',
            auth: authClient,
        });

        return new GoogleSheetsApiService(sheets, spreadsheetId);
    }

    // Fetch data from a Google Sheets range
    public async getSheetData(range: string): Promise<any[][]> {
        const request = {
            spreadsheetId: this.spreadsheetId,
            range: range,
        };

        const response = await this.sheets.spreadsheets.values.get(request);
        return response.data.values || [];
    }

    public async appendDataToSheet(values: (string|number)[][], sheetName: string): Promise<void> {
        // Get the last row in the table (from column A)
        const lastRow = await this.getLastRow(sheetName);

        // Calculate the next available row
        const nextRow = lastRow + 1;

        // Define the range starting from the next available row
        const range = `${sheetName}!A${nextRow}:Z${nextRow + values.length - 1}`; // Adjust range based on new records

        const valueRange = {
            values: values,
        };

        // Append the new records
        await this.sheets.spreadsheets.values.append({
            spreadsheetId: this.spreadsheetId,
            range: range,
            valueInputOption: 'USER_ENTERED', // Use USER_ENTERED to let Sheets handle the data types
            insertDataOption: 'INSERT_ROWS',
            requestBody: valueRange,
        });

        // After appending, adjust filters or tables
        //await this.expandFilterRange(sheetName, nextRow + newRecords.length - 1);
    }

    // Sort the sheet by date (assumed first column contains dates)
    public async sortSheetByDate(): Promise<void> {
        const sortRequest = {
            range: {
                sheetId: await this.getSheetId(),
                startRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: await this.getColumnCount(),
            },
            sortSpecs: [
                {
                    dimensionIndex: 0, // Assuming first column contains dates
                    sortOrder: 'ASCENDING',
                },
            ],
        };

        const batchUpdateRequest = {
            requests: [
                {
                    sortRange: sortRequest,
                },
            ],
        };

        await this.sheets.spreadsheets.batchUpdate({
            spreadsheetId: this.spreadsheetId,
            requestBody: batchUpdateRequest,
        });
    }

    // Get the sheet ID based on the sheet name
    private async getSheetId(): Promise<number> {
        const response = await this.sheets.spreadsheets.get({
            spreadsheetId: this.spreadsheetId,
        });

        const sheet = response.data.sheets?.find((s) => s.properties?.title === MainSheetName);

        return sheet?.properties?.sheetId ?? 0;
    }

    // Get the column count of the sheet
    private async getColumnCount(): Promise<number> {
        const response = await this.sheets.spreadsheets.get({
            spreadsheetId: this.spreadsheetId,
        });

        const sheet = response.data.sheets?.find((s) => s.properties?.title === MainSheetName);

        return sheet?.properties?.gridProperties?.columnCount ?? DefaultColumnCount;
    }

    // Get the column range in A1 notation
    public async getColumnRange(): Promise<string> {
        const columnCount = await this.getColumnCount();
        return this.convertColumnIndexToLetter(columnCount);
    }

    // Helper function to convert column index (e.g., 26) to column letter (e.g., 'Z')
    private convertColumnIndexToLetter(index: number): string {
        let letter = '';
        while (index > 0) {
            index--;
            letter = String.fromCharCode('A'.charCodeAt(0) + (index % 26)) + letter;
            index = Math.floor(index / 26);
        }
        return letter;
    }

    public async getLastRow(sheetName: string): Promise<number> {
        const data = await this.getSheetData(`${sheetName}!A:A`);
        return data.length;
    }
}
