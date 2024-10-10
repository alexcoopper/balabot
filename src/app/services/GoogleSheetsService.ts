import { SheetName } from '../constants';
import { ExcelParserFactory } from '../excel-parser/ExcelParserFactory';
import { ExpenseFilterService } from './ExpenseFilterService';
import { GoogleSheetsApiService } from './GoogleSheetsApiService';
import { Telegram } from 'telegraf';

export class GoogleSheetsService {
    private apiService: GoogleSheetsApiService;
    private filterService: ExpenseFilterService;
    private excelParserFactory: ExcelParserFactory;

    // Private constructor to prevent direct instantiation
    private constructor(apiService: GoogleSheetsApiService, filterService: ExpenseFilterService, excelParserFactory: ExcelParserFactory) {
        this.apiService = apiService;
        this.filterService = filterService;
        this.excelParserFactory = excelParserFactory;
    }

    // Static async factory method to create an instance of GoogleSheetsService
    public static async create(): Promise<GoogleSheetsService> {
        const apiService = await GoogleSheetsApiService.create();  // Asynchronously create the API service
        const filterService = new ExpenseFilterService();  // No need for async, as it's a regular class
        const excelParserFactory = new ExcelParserFactory();

        return new GoogleSheetsService(apiService, filterService, excelParserFactory);
    }


    public async handleExcelFile(fileId: string, telegram: Telegram, replyCallback: (message: string) => void): Promise<void> {
        try {
            // Fetch the file link from Telegram
            const fileLink = await telegram.getFileLink(fileId);
            const response = await fetch(fileLink.href);
            const buffer = Buffer.from(await response.arrayBuffer());

            // Process and upload data to Google Sheets
            const newRecordsCount = await this.WriteDataToSheet(buffer);

            if (newRecordsCount > 0) {
                replyCallback(`Excel data uploaded to Google Sheets successfully! ${newRecordsCount} new record(s) added.`);
            } else {
                replyCallback('Excel data was processed, but no new records were added to Google Sheets.');
            }
        } catch (error) {
            console.error('Error uploading to Google Sheets:', error);
            replyCallback('Failed to upload data to Google Sheets.');
        }
    }

    // Method to write data to the Google Sheet
    private async WriteDataToSheet(buffer: Buffer): Promise<number> {
        const parser = this.excelParserFactory.GetParser(buffer);
        const expenses =  parser.ParseExcel();

        const columnRange = await this.apiService.getColumnRange();

        // Fetch existing data from Google Sheets
        const existingData = await this.apiService.getSheetData(`${SheetName}!A2:${columnRange}`);

        // Filter out new records (those not already in Google Sheets)
        const newRecords = this.filterService.FilterNewExpenses(expenses, existingData);

        if (newRecords.length > 0) {
            // Append new records to Google Sheets
            await this.apiService.appendDataToSheet(newRecords, SheetName);
            // Optionally sort by date after appending
            await this.apiService.sortSheetByDate();
        } else {
            console.log("No new records to append.");
        }

        return  newRecords.length;
    }
}

