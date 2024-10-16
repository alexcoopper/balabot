import { GoogleSheetDateTimeFormat, GoogleSheetPageUrlTemplate, MainSheetName, OwnExpensesSheetName } from '../constants';
import { ExcelParserFactory } from '../excel-parser/ExcelParserFactory';
import { BalanceSummary, Expense, ExpenseOwner, ExpenseType } from '../models';
import { ExpenseFilterService } from './ExpenseFilterService';
import { GoogleSheetsApiService } from './GoogleSheetsApiService';
import { Telegram } from 'telegraf';
import { format } from 'date-fns';

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

            if (!parser) {
                return;
            }

            replyCallback('Починаю\\.\\.\\.');

            const expenses = parser.ParseExcel();
            const newRecordsCount = await this.WriteExpensesToSheet(expenses);

            const url = GoogleSheetPageUrlTemplate
                .replace('{spreadsheetId}', process.env.SPREADSHEET_ID || '')
                .replace('{sheetId}', '0');
            let messageTemplate = '';
            if (newRecordsCount > 0) {
                messageTemplate = `Успішно загружено! ${newRecordsCount} нових записів додано. Посилання на документ urlPart.`;
            } else {
                messageTemplate = `Файл опрацьован, але нових запиів не виявлено. Посилання на документ urlPart.`;
            }
            messageTemplate = messageTemplate.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
            replyCallback(messageTemplate.replace('urlPart', `[тут](${url})`));
        } catch (error) {
            console.error('Error uploading to Google Sheets:', error);
            replyCallback('Failed to upload data to Google Sheets.');
        }
    }

    // Method to write data to the Google Sheet
    public async WriteExpensesToSheet(expenses: Expense[]): Promise<number> {
        const columnRange = await this.apiService.getColumnRange();

        // Fetch existing data from Google Sheets
        const existingData = await this.apiService.getSheetData(`${MainSheetName}!A2:${columnRange}`);

        // Filter out new records (those not already in Google Sheets)
        const newRecords = this.filterService.FilterNewExpenses(expenses, existingData);

        if (newRecords.length > 0) {
            // Append new records to Google Sheets

            const values = newRecords.map((expense) => {
                const formattedDate = format(expense.Date, GoogleSheetDateTimeFormat);
                const sum = expense.Sum > 0 ? expense.Sum : -expense.Sum;
                return [
                    formattedDate,
                    expense.Description,
                    sum,
                    expense.ExpenseOwner,
                    expense.Sum > 0 ? ExpenseType.Income : ExpenseType.Outcome,
                ];
            });

            await this.apiService.appendDataToSheet(values, MainSheetName);
            // Optionally sort by date after appending
            await this.apiService.sortSheetByDate();
            console.log(`WriteExpensesToSheet: Uploaded ${newRecords.length} record(s).`);
        } else {
            console.log('WriteExpensesToSheet: No new records to append.');
        }

        return newRecords.length;
    }

    public async WriteOwnExpensesToSheet(expenses: Expense[]): Promise<void> {
        const values = expenses.map((expense) => {
            const formattedDate = format(expense.Date, GoogleSheetDateTimeFormat);
            return [
                formattedDate,
                expense.Description,
                expense.Sum,
                expense.ExpenseOwner
            ];
        });
        await this.apiService.appendDataToSheet(values, OwnExpensesSheetName);
    }

    public async getBalanceByOwnerAndPeriod(owner: ExpenseOwner, period: string): Promise<BalanceSummary | undefined> {
        try {
            const data = await this.apiService.getSheetData(`ResultsTable`);

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
