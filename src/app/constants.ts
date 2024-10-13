import * as path from 'path';

// Define a constant path for the credentials file in the 'dist' directory
export const credentialsPath = path.join(path.resolve(__dirname, '..'), 'credentials_g.json');

export const SheetName = 'Full';
export const UserMappingsSheetRange = 'UserMapping!A2:B';
export const Scopes = ['https://www.googleapis.com/auth/spreadsheets'];
export const ApplicationName = 'ExpenseManager';
export const DefaultColumnCount = 5;
export const GoogleSheetDateTimeFormat = 'MM/dd/yyyy HH:mm:ss';
export const GoogleSheetPageUrlTemplate = 'https://docs.google.com/spreadsheets/d/{sheetId}';
