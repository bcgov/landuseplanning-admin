import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

// Refs:
// https://github.com/luwojtaszek/ngx-excel-export
// https://www.npmjs.com/package/xlsx
// https://github.com/SheetJS/js-xlsx

@Injectable()
export class ExcelService {
  constructor() {}

  /**
   * Get an array of JSON data and turn it into an Excel spreadsheet. You can
   * specify the name of the outputted file and the column order.
   *
   * @param {array} data Array of json data to turn into excel file.
   * @param {string} excelFileName The excel filename without extension.
   * @param {array} columnOrder The order of the spreadsheet columns.
   * @return {void}
   */
  public exportAsExcelFile(data: any[], excelFileName: string, columnOrder: string[] = []): void {
    const json_opts: XLSX.JSON2SheetOpts = { header: columnOrder };
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data, json_opts);
    const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const write_opts: XLSX.WritingOptions = { bookType: 'xlsx' };
    XLSX.writeFile(workbook, excelFileName + '.xlsx', write_opts);
  }
}
