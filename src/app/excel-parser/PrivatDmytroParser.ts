import * as XLSX from 'xlsx';
import { IExcelParser } from './IExcelParser';
import { Expense, ExpenseOwner } from '../models';
import { parse } from 'date-fns';

export class PrivatDmytroParser implements IExcelParser {
    private workbook: XLSX.WorkBook;

    constructor(workbook: XLSX.WorkBook) {
        this.workbook = workbook;
    }

    public ParseExcel(): Expense[] {
        const expenses: Expense[] = [];
        const worksheet = this.workbook.Sheets[this.workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });

        for (let row = 2; row < data.length; row++) {
            const rowData = data[row];
            if (!rowData || !rowData[0]) continue;

            const date = rowData[0];
            const time = rowData[1];
            const description = rowData[4];
            const sum = rowData[5];

            const parsedDate = parse(`${date} ${time}`, 'dd.MM.yyyy HH:mm', new Date());

            const expense: Expense = {
                Date: parsedDate,
                Description: description,
                Sum: parseFloat(sum),
                ExpenseOwner: ExpenseOwner.Dmytro
            };

            expenses.push(expense);
        }

        return expenses;
    }
}
