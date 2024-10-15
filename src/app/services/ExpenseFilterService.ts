import { Expense, ExpenseType } from '../models';

export class ExpenseFilterService {
    public FilterNewExpenses(newExpenses: Expense[], existingData: any[][]): Expense[] {
        const dateColumnIndex = 0;
        const expenseOwnerColumnIndex = 3;
        const sumColumnIndex = 2;
        const IncomeOutcomeColumnIndex = 4;

        const filteredExpenses: Expense[] = [];

        for (const expense of newExpenses) {
            const exists = existingData.some((row) => {
                if (row.length > expenseOwnerColumnIndex) {
                    const rowDate = row[dateColumnIndex]?.toString();
                    const rowOwner = row[expenseOwnerColumnIndex]?.toString();
                    const sum = parseFloat(row[sumColumnIndex].replace(/,/g, ''));
                    const incomeOutcome: ExpenseType = row[IncomeOutcomeColumnIndex].toString();

                    const parsedDate = new Date(rowDate);
                    const expenseDate = expense.Date;

                    // Check if date and owner match
                    const result =  parsedDate.getTime() === expenseDate.getTime() 
                        && rowOwner === expense.ExpenseOwner
                        && (incomeOutcome === ExpenseType.Outcome ? sum === expense.Sum *-1 : sum === expense.Sum);

                    return result;
                        
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
