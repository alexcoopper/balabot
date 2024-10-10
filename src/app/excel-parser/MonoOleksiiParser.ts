
import * as XLSX from 'xlsx';
import { IExcelParser } from './IExcelParser';
import { Expense, ExpenseOwner } from '../models';
import { parse } from 'date-fns';

export class MonoOleksiiParser implements IExcelParser {
    private workbook: XLSX.WorkBook;

    constructor(workbook: XLSX.WorkBook) {
        this.workbook = workbook;
    }

    public ParseExcel(): Expense[] {
        const expenses: Expense[] = [];
        const worksheet = this.workbook.Sheets[this.workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });

        for (let row = 22; row < data.length; row++) {
            const rowData = data[row];
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
