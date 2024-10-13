import { GoogleSheetPageUrlTemplate, SheetName } from '../constants';
import { ExcelParserFactory } from '../excel-parser/ExcelParserFactory';
import { BalanceSummary, Expense, ExpenseOwner } from '../models';
import { ExpenseFilterService } from './ExpenseFilterService';
import { GoogleSheetsApiService } from './GoogleSheetsApiService';
import { Telegram } from 'telegraf';

export class GoogleSheetsService {
    private apiService: GoogleSheetsApiService;
    private filterService: ExpenseFilterService;
    private excelParserFactory: ExcelParserFactory;

    // Private constructor to prevent direct instantiation
    private constructor(
        apiService: GoogleSheetsApiService,
        filterService: ExpenseFilterService,
        excelParserFactory: ExcelParserFactory,
    ) {
        this.apiService = apiService;
        this.filterService = filterService;
        this.excelParserFactory = excelParserFactory;
    }

    // Static async factory method to create an instance of GoogleSheetsService
    public static async create(): Promise<GoogleSheetsService> {
        const apiService = await GoogleSheetsApiService.create(); // Asynchronously create the API service
        const filterService = new ExpenseFilterService(); // No need for async, as it's a regular class
        const excelParserFactory = new ExcelParserFactory();

        return new GoogleSheetsService(apiService, filterService, excelParserFactory);
    }

    public async handleExcelFile(
        fileId: string,
        telegram: Telegram,
        replyCallback: (message: string) => void,
    ): Promise<void> {
        try {
            // Fetch the file link from Telegram
            const fileLink = await telegram.getFileLink(fileId);
            const response = await fetch(fileLink.href);
            const buffer = Buffer.from(await response.arrayBuffer());

            // Process and upload data to Google Sheets
            const parser = this.excelParserFactory.GetParser(buffer);
            const expenses = parser.ParseExcel();
            const newRecordsCount = await this.WriteExpensesToSheet(expenses);

            const url = GoogleSheetPageUrlTemplate.replace('{sheetId}', process.env.SPREADSHEET_ID || '');
            let messageTemplate = '';
            if (newRecordsCount > 0) {
                messageTemplate = `Excel data uploaded successfully! ${newRecordsCount} new record(s) added. You can review the updated data urlPart.`;
            } else {
                messageTemplate = `Excel data was processed, but no new records were added to Google Sheets. You can review the existing data urlPart.`;
            }
            messageTemplate = messageTemplate.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
            replyCallback(messageTemplate.replace('urlPart', `[here](${url})`));
        } catch (error) {
            console.error('Error uploading to Google Sheets:', error);
            replyCallback('Failed to upload data to Google Sheets.');
        }
    }

    // Method to write data to the Google Sheet
    public async WriteExpensesToSheet(expenses: Expense[]): Promise<number> {
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
            console.log(`WriteExpensesToSheet: Uploaded ${newRecords.length} record(s).`);
        } else {
            console.log('WriteExpensesToSheet: No new records to append.');
        }

        return newRecords.length;
    }

    public async getBalanceByOwnerAndPeriod(owner: ExpenseOwner, period: string): Promise<BalanceSummary | undefined> {
        try {
            const data = await this.apiService.getSheetData(`Results!A2:G7`);

            const balanceSummaries: BalanceSummary[] = data.map((row) => ({
                expenseOwner: row[0],
                period: row[1],
                sumAll: parseFloat(row[2]),
                sumCommon: parseFloat(row[3]),
                spentToBrother: parseFloat(row[4]),
                totalSpentToBrother: parseFloat(row[5]),
                balance: parseFloat(row[6]),
            }));

            const balanceSummary = balanceSummaries.find(
                (balance) => balance.expenseOwner === owner && balance.period === period,
            );

            return balanceSummary;
        } catch (error) {
            console.error('Error retrieving balance by owner and period from Google Sheets:', error);
            throw new Error('Failed to load balance.');
        }
    }
}
