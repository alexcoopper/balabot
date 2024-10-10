import { format } from 'date-fns';
import { Expense, ExpenseType } from '../models';
import { GoogleSheetDateTimeFormat } from '../constants';
import exp from 'constants';


export class ExpenseFilterService {
    public FilterNewExpenses(newExpenses: Expense[], existingData: any[][]): any[][] {
        const dateColumnIndex = 0;
        const expenseOwnerColumnIndex = 3;

        const filteredExpenses: any[][] = [];

        for (const expense of newExpenses) {
            const exists = existingData.some(row => {
                if (row.length > expenseOwnerColumnIndex) {
                    const rowDate = row[dateColumnIndex]?.toString();
                    const rowOwner = row[expenseOwnerColumnIndex]?.toString();
                    
                    const parsedDate = new Date(rowDate);
                    const expenseDate = expense.Date;

                    // Check if date and owner match
                    return parsedDate.getTime() === expenseDate.getTime() && rowOwner === expense.ExpenseOwner;
                }
                return false;
            });

            if (!exists) {
                const formattedDate = format(expense.Date, GoogleSheetDateTimeFormat);
                const sum = expense.Sum > 0 ? expense.Sum : -expense.Sum;

                filteredExpenses.push([
                    formattedDate,
                    expense.Description,
                    sum,
                    expense.ExpenseOwner,
                    expense.Sum > 0 ? ExpenseType.Income : ExpenseType.Outcome
                ]);
            }
        }

        return filteredExpenses;
    }
}
