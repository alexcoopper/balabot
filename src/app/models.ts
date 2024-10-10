export enum ExpenseOwner {
    Oleksii = 'Oleksii',
    Dmytro = 'Dmytro'
}

export enum ExpenseType {
    Income = 'Income',
    Outcome = 'Outcome'
}

export interface Expense {
    Date: Date;
    Description: string;
    Sum: number;
    ExpenseOwner: ExpenseOwner;
}