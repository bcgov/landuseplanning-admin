import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

// Refs:
// https://github.com/luwojtaszek/ngx-excel-export
// https://www.npmjs.com/package/xlsx
// https://github.com/SheetJS/js-xlsx

@Injectable()
export class ExcelService {

    constructor() { }

    public exportAsExcelFile(data: any[], excelFileName: string): void {
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data, {});
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        XLSX.writeFile(workbook, excelFileName + '.xlsx', {});
    }

}
