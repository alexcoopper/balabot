import * as XLSX from 'xlsx';
import { MonoOleksiiParser } from './MonoOleksiiParser';
import { PrivatDmytroWebFileParser } from './PrivatDmytroWebFileParser';
import { IExcelParser } from './IExcelParser';
import { PrivatDmytroMobileFileParser } from './PrivatDmytroMobileFileParser';

export class ExcelParserFactory {
    private parsers: Array<{isValidFormat(data: string[][]): boolean; new(data: string[][]): IExcelParser }> = [
        MonoOleksiiParser,
        PrivatDmytroWebFileParser,
        PrivatDmytroMobileFileParser
    ];

    public GetParser(buffer: Buffer): IExcelParser|null {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const data: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true }) as any[][];

        for (const Parser of this.parsers) {
            if (Parser.isValidFormat(data)) {
                return new Parser(data);
            }
        }
        console.log("ExcelParserFactory: Unsupported Excel file format.");
        return null;
    }
}
