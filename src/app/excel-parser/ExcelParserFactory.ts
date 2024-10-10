import * as XLSX from 'xlsx';
import { MonoOleksiiParser } from './MonoOleksiiParser';
import { PrivatDmytroParser } from './PrivatDmytroParser';
import { IExcelParser } from './IExcelParser';

export class ExcelParserFactory {
    public GetParser(buffer: Buffer): IExcelParser {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Assert the return type from sheet_to_json to be an array of arrays
        const firstRow: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        const firstCell = firstRow[0]?.[0];  // Safely access the first cell

        if (typeof firstCell === 'string') {
            if (firstCell.includes('Клієнт: Баланенко Олексій Євгенович')) {
                return new MonoOleksiiParser(workbook);
            }

            if (firstCell.includes('Виписка з Ваших карток за період')) {
                return new PrivatDmytroParser(workbook);
            }
        }

        throw new Error('Unknown Excel format');
    }
}
