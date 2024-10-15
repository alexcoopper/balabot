
import * as XLSX from 'xlsx';
import { IExcelParser } from './IExcelParser';
import { Expense, ExpenseOwner } from '../models';
import { parse } from 'date-fns';

export class MonoOleksiiParser implements IExcelParser {
    private workbookData: string[][];

    private static expectedHeaders = [
        'Дата i час операції',
        'Деталі операції',
        'MCC',
        'Сума в валюті картки (UAH)',
        'Сума в валюті операції',
        'Валюта',
        'Курс',
        'Сума комісій (UAH)',
        'Сума кешбеку (UAH)',
        'Залишок після операції'
    ];

    constructor(workbookData: string[][]) {
        this.workbookData = workbookData;
    }

    public static isValidFormat(data: any[]): boolean {
        const documentDescription = data[0]; 
        const headers = data[21];
        const isCorrectDescription = documentDescription[0]?.includes('Клієнт: Баланенко Олексій Євгенович');
        const headersMatch = this.expectedHeaders.every((header, index) => headers[index] === header);
        return isCorrectDescription && headersMatch;

    }

    public ParseExcel(): Expense[] {
        const expenses: Expense[] = [];

        for (let row = 22; row < this.workbookData.length; row++) {
            const rowData = this.workbookData[row];
            if (!rowData || !rowData[0]) continue;

            const date = rowData[0];
            const description = rowData[1];
            const sum = rowData[3];

            const parsedDate = parse(date, 'dd.MM.yyyy HH:mm:ss', new Date());

            const expense: Expense = {
                Date: parsedDate,
                Description: description,
                Sum: parseFloat(sum),
                ExpenseOwner: ExpenseOwner.Oleksii
            };

            expenses.push(expense);
        }

        return expenses;
    }
}
