import { Expense } from '../models';

export class ExpenseFilterService {
    public FilterNewExpenses(newExpenses: Expense[], existingData: any[][]): Expense[] {
        const dateColumnIndex = 0;
        const expenseOwnerColumnIndex = 3;

        const filteredExpenses: Expense[] = [];

        for (const expense of newExpenses) {
            const exists = existingData.some((row) => {
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
                filteredExpenses.push(expense);
            }
        }

        return filteredExpenses;
    }
}
