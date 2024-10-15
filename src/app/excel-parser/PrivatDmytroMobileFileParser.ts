import * as XLSX from 'xlsx';
import { IExcelParser } from './IExcelParser';
import { Expense, ExpenseOwner } from '../models';
import { parse } from 'date-fns';

export class PrivatDmytroMobileFileParser implements IExcelParser {
    private workbookData: string[][];

    private static expectedHeaders = [
        'Дата',
        'Категорія',
        'Картка',
        'Опис операції',
        'Сума в валюті картки',
        'Валюта картки',
        'Сума в валюті транзакції',
        'Валюта транзакції',
        'Залишок на кінець періоду',
        'Валюта залишку'
    ];

    constructor(workbookData: string[][]) {
        this.workbookData = workbookData;
    }

    public static isValidFormat(data: any[]): boolean {
        const documentDescription = data[0]; 
        const headers = data[1];
        const isCorrectDescription = documentDescription[0]?.includes('Виписка з Ваших карток за період');
        const headersMatch = this.expectedHeaders.every((header, index) => headers[index] === header);
        return isCorrectDescription && headersMatch;
    }

    public ParseExcel(): Expense[] {
        const expenses: Expense[] = [];

        for (let row = 2; row < this.workbookData.length; row++) {
            const rowData = this.workbookData[row];
            if (!rowData || !rowData[0]) continue;

            const date = parse(rowData[0], 'dd.MM.yyyy HH:mm:ss', new Date());
            date.setSeconds(0);
            const description = `${rowData[3]} (${rowData[1]})`;
            const sum = rowData[4];


            const expense: Expense = {
                Date: date,
                Description: description,
                Sum: parseFloat(sum),
                ExpenseOwner: ExpenseOwner.Dmytro
            };

            expenses.push(expense);
        }

        return expenses;
    }
}
