import { Scenes } from 'telegraf';
import { AmountWizardSession } from './bot-scenes/amountAndCommentWizard';
import { BalanceWizardSession } from './bot-scenes/balanceWizard';

export enum ExpenseOwner {
    Oleksii = 'Oleksii',
    Dmytro = 'Dmytro',
}

export enum NotificationType {
    DailyNotification = 'DailyNotification',
    TrashReminder = 'TrashReminder',
}

export enum ExpenseType {
    Income = 'Income',
    Outcome = 'Outcome',
}

export interface Expense {
    Date: Date;
    Description: string;
    Sum: number;
    ExpenseOwner: ExpenseOwner;
}

export enum BalancePeriod {
    All = 'All',
    DoneOnly = 'Done',
    InProgress = 'In progress',
}

export interface BalanceSummary {
    expenseOwner: ExpenseOwner;
    period: BalancePeriod;
    sumAll: number;
    sumCommon: number;
    spentToBrother: number;
    totalSpentToBrother: number;
    balance: number;
}

export interface BalaBotSession extends AmountWizardSession, BalanceWizardSession {}
export interface BalaBotContext extends Scenes.WizardContext<BalaBotSession> {}
