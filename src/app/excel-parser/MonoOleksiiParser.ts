
import * as XLSX from 'xlsx';
import { IExcelParser } from './IExcelParser';
import { Expense, ExpenseOwner } from '../models';
import { parse } from 'date-fns';

export class MonoOleksiiParser implements IExcelParser {
    private workbookData: string[][];

    constructor(workbookData: string[][]) {
        this.workbookData = workbookData;
    }

    public static isValidFormat(data: any[]): boolean {
        return true;
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
