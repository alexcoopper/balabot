import { Scenes } from 'telegraf';
import { AddCashWizardSession } from './bot-scenes/amountAndCommentWizard';
import { BalanceWizardSession } from './bot-scenes/balanceWizard';
import { SetOurWizardSession } from './bot-scenes/setOurWizard';

export enum ExpenseOwner {
    Oleksii = 'Oleksii',
    Dmytro = 'Dmytro',
}

export enum NotificationType {
    DailyNotification = 'DailyNotification',
    TrashReminder = 'TrashReminder',
    CacheAddedNotification = 'CacheAddedNotification',
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

export interface BalaBotSession extends AddCashWizardSession, BalanceWizardSession, SetOurWizardSession {}
export interface BalaBotContext extends Scenes.WizardContext<BalaBotSession> {}
