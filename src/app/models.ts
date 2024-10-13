import { Scenes } from 'telegraf';
import { AmountWizardSession } from './bot-scenes/amountAndCommentWizard';

export enum ExpenseOwner {
    Oleksii = 'Oleksii',
    Dmytro = 'Dmytro',
}

export enum NotificationType {
    DailyNotification = 'DailyNotification',
    TrashReminder = 'TrashReminder'
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

export interface BalaBotSession extends AmountWizardSession {}
export interface BalaBotContext extends Scenes.WizardContext<BalaBotSession> {}
