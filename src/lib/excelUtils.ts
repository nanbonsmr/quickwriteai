import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export interface ExcelData {
  sheets: SheetData[];
  title?: string;
}

export interface SheetData {
  name: string;
  type: 'table' | 'todo' | 'report' | 'chart-data';
  headers: string[];
  rows: (string | number | boolean)[][];
  styling?: SheetStyling;
  chartConfig?: ChartConfig;
}

export interface SheetStyling {
  headerColor?: string;
  alternateRowColors?: boolean;
  freezeTopRow?: boolean;
  autoFilter?: boolean;
  conditionalFormatting?: ConditionalFormat[];
}

export interface ConditionalFormat {
  column: number;
  type: 'highlight' | 'dataBar' | 'icon';
  rules?: { min?: number; max?: number; color?: string }[];
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'area';
  title?: string;
  labelColumn: number;
  dataColumns: number[];
}

// Color palette for Excel
const colors = {
  primary: 'FF4F46E5',
  success: 'FF10B981',
  warning: 'FFF59E0B',
  danger: 'FFEF4444',
  info: 'FF3B82F6',
  purple: 'FF8B5CF6',
  pink: 'FFEC4899',
  dark: 'FF1F2937',
  light: 'FFF3F4F6',
  white: 'FFFFFFFF',
};

// Generate professional Excel file
export async function generateExcel(data: ExcelData): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'PeakDraft AI';
  workbook.created = new Date();

  for (const sheet of data.sheets) {
    const worksheet = workbook.addWorksheet(sheet.name, {
      properties: { tabColor: { argb: colors.primary } }
    });

    // Add headers
    const headerRow = worksheet.addRow(sheet.headers);
    
    // Style headers
    headerRow.eachCell((cell, colNumber) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: sheet.styling?.headerColor || colors.primary }
      };
      cell.font = {
        bold: true,
        color: { argb: colors.white },
        size: 12
      };
      cell.alignment = { 
        vertical: 'middle', 
        horizontal: 'center',
        wrapText: true 
      };
      cell.border = {
        bottom: { style: 'medium', color: { argb: colors.dark } }
      };
    });
    headerRow.height = 28;

    // Add data rows
    sheet.rows.forEach((rowData, rowIndex) => {
      const row = worksheet.addRow(rowData);
      
      row.eachCell((cell, colNumber) => {
        // Alternate row colors
        if (sheet.styling?.alternateRowColors && rowIndex % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FAFB' }
          };
        }

        // Style based on content type
        const value = cell.value;
        
        // Checkbox for todo items
        if (sheet.type === 'todo' && colNumber === 1) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          if (value === true || value === 'Done' || value === '✓') {
            cell.font = { color: { argb: colors.success } };
            cell.value = '✓';
          } else if (value === false || value === 'Pending' || value === '○') {
            cell.font = { color: { argb: colors.warning } };
            cell.value = '○';
          }
        }

        // Number formatting
        if (typeof value === 'number') {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          // Currency detection
          const header = sheet.headers[colNumber - 1]?.toLowerCase() || '';
          if (header.includes('price') || header.includes('cost') || header.includes('amount') || header.includes('revenue') || header.includes('salary')) {
            cell.numFmt = '"$"#,##0.00';
          } else if (header.includes('percent') || header.includes('%')) {
            cell.numFmt = '0.00%';
          } else {
            cell.numFmt = '#,##0.00';
          }
        }

        // Date detection and formatting
        if (typeof value === 'string' && isDateString(value)) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }

        // Priority/Status highlighting for reports
        if (sheet.type === 'report' || sheet.type === 'todo') {
          const strValue = String(value).toLowerCase();
          if (strValue === 'high' || strValue === 'urgent' || strValue === 'critical') {
            cell.font = { bold: true, color: { argb: colors.danger } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
          } else if (strValue === 'medium' || strValue === 'normal') {
            cell.font = { color: { argb: colors.warning } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };
          } else if (strValue === 'low' || strValue === 'done' || strValue === 'completed') {
            cell.font = { color: { argb: colors.success } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } };
          }
        }

        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        };
      });
      
      row.height = 22;
    });

    // Auto-fit columns
    worksheet.columns.forEach((column, index) => {
      let maxLength = sheet.headers[index]?.length || 10;
      sheet.rows.forEach(row => {
        const cellValue = row[index];
        const cellLength = cellValue ? String(cellValue).length : 0;
        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      });
      column.width = Math.min(Math.max(maxLength + 2, 12), 40);
    });

    // Freeze top row
    if (sheet.styling?.freezeTopRow !== false) {
      worksheet.views = [
        { state: 'frozen', xSplit: 0, ySplit: 1, topLeftCell: 'A2', activeCell: 'A2' }
      ];
    }

    // Auto filter
    if (sheet.styling?.autoFilter !== false && sheet.headers.length > 0) {
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1 + sheet.rows.length, column: sheet.headers.length }
      };
    }

    // Add summary row for numeric columns
    if (sheet.type === 'report' || sheet.type === 'chart-data') {
      const lastRow = worksheet.lastRow?.number || 1;
      const summaryRow = worksheet.addRow([]);
      summaryRow.getCell(1).value = 'TOTAL';
      summaryRow.getCell(1).font = { bold: true };
      
      sheet.headers.forEach((header, index) => {
        const colLetter = String.fromCharCode(65 + index);
        const hasNumbers = sheet.rows.some(row => typeof row[index] === 'number');
        
        if (hasNumbers && index > 0) {
          summaryRow.getCell(index + 1).value = { 
            formula: `SUM(${colLetter}2:${colLetter}${lastRow})` 
          };
          summaryRow.getCell(index + 1).font = { bold: true };
          summaryRow.getCell(index + 1).numFmt = '"$"#,##0.00';
        }
      });

      summaryRow.eachCell(cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E7FF' }
        };
        cell.border = {
          top: { style: 'medium', color: { argb: colors.primary } }
        };
      });
    }
  }

  // Generate blob
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
}

// Save Excel file
export async function saveExcel(data: ExcelData, filename: string): Promise<void> {
  const blob = await generateExcel(data);
  saveAs(blob, `${filename}.xlsx`);
}

// Parse user input into structured data
export function parseUserData(input: string): { headers: string[]; rows: (string | number | boolean)[][] } {
  const lines = input.trim().split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  // Detect delimiter
  const firstLine = lines[0];
  let delimiter = ',';
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes('|')) delimiter = '|';
  else if (firstLine.includes(';')) delimiter = ';';

  // Parse headers
  const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
  
  // Parse rows
  const rows = lines.slice(1).map(line => {
    return line.split(delimiter).map(cell => {
      const trimmed = cell.trim().replace(/^["']|["']$/g, '');
      
      // Try to parse as number
      const num = parseFloat(trimmed.replace(/[$,]/g, ''));
      if (!isNaN(num) && trimmed.match(/^[\d$,.-]+$/)) {
        return num;
      }
      
      // Boolean detection
      if (trimmed.toLowerCase() === 'true' || trimmed === '✓' || trimmed.toLowerCase() === 'yes') {
        return true;
      }
      if (trimmed.toLowerCase() === 'false' || trimmed === '○' || trimmed.toLowerCase() === 'no') {
        return false;
      }
      
      return trimmed;
    });
  });

  return { headers, rows };
}

// Helper function to detect date strings
function isDateString(value: string): boolean {
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/,
    /^\d{2}\/\d{2}\/\d{4}$/,
    /^\d{2}-\d{2}-\d{4}$/,
    /^[A-Za-z]{3}\s\d{1,2},?\s\d{4}$/
  ];
  return datePatterns.some(pattern => pattern.test(value));
}

// Detect sheet type from data
export function detectSheetType(headers: string[]): 'table' | 'todo' | 'report' | 'chart-data' {
  const lowerHeaders = headers.map(h => h.toLowerCase());
  
  if (lowerHeaders.some(h => h.includes('task') || h.includes('todo') || h.includes('done') || h.includes('completed'))) {
    return 'todo';
  }
  
  if (lowerHeaders.some(h => h.includes('month') || h.includes('quarter') || h.includes('year') || h.includes('revenue') || h.includes('sales'))) {
    return 'chart-data';
  }
  
  if (lowerHeaders.some(h => h.includes('status') || h.includes('priority') || h.includes('category'))) {
    return 'report';
  }
  
  return 'table';
}

// Generate chart as image using Chart.js (will be called from component)
export function getChartColors(count: number): string[] {
  const palette = [
    'rgba(79, 70, 229, 0.8)',   // Primary
    'rgba(16, 185, 129, 0.8)',  // Success
    'rgba(245, 158, 11, 0.8)',  // Warning
    'rgba(239, 68, 68, 0.8)',   // Danger
    'rgba(59, 130, 246, 0.8)',  // Info
    'rgba(139, 92, 246, 0.8)',  // Purple
    'rgba(236, 72, 153, 0.8)',  // Pink
    'rgba(6, 182, 212, 0.8)',   // Cyan
    'rgba(132, 204, 22, 0.8)',  // Lime
    'rgba(249, 115, 22, 0.8)',  // Orange
  ];
  
  return Array(count).fill(null).map((_, i) => palette[i % palette.length]);
}
