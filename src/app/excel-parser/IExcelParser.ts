import { Expense } from '../models';

export interface IExcelParser {
    ParseExcel(): Expense[];
}
