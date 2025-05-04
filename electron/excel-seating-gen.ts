import path from 'path';
import fs from 'fs';
import ExcelJS from 'exceljs';

// Updated Room class to match the new structure in rooms.store.ts
class Room {
  name: string;
  columns: { rowCount: number }[];
  capacity: number;
  buildingLocation: string;
  seatingGrid: (string | null)[][]; // Stores student IDs

  constructor(name: string, columns: { rowCount: number }[], buildingLocation: string = "DE-MORGAN BLOCK FIRST FLOOR") {
    this.name = name;
    this.columns = columns;
    // Calculate total capacity from all columns
    this.capacity = columns.reduce((sum, col) => sum + col.rowCount, 0);
    this.buildingLocation = buildingLocation;
    
    // Find the maximum row count across all columns
    const maxRows = Math.max(...columns.map(col => col.rowCount));
    
    // Initialize grid with nulls - now using column-specific row counts
    this.seatingGrid = Array(maxRows).fill(null).map(() => Array(columns.length).fill(null));
  }
}

export interface ExamConfig {
  examName: string;
  examDate: string;
  examTime: string;
  cloakRoom: string;
  instructions: string[];
  logoPath?: string;
}

// Define the structure for student input
export interface StudentGroup {
  branchCode: string; // Identifier for the group
  subjectCode: string; // Another identifier
  studentList: string[]; // List of student IDs
}

export interface SeatingPlanOptions {
  outputFile: string;
  examConfig: ExamConfig;
  studentGroups: StudentGroup[];
  rooms: Room[];
}

// Updated to work with the new room structure
function assignSeatsByGroup(studentGroups: StudentGroup[], rooms: Room[]): Room[] {
  // Log student group info
  studentGroups.forEach((g) => {
    console.log(g.branchCode, g.subjectCode);
  });
  
  const groupMap = new Map<number, string[]>();
  studentGroups.forEach((group, index) => {
    groupMap.set(index, [...group.studentList]); // Use index as key, copy student list
  });

  const groupIndices = Array.from(groupMap.keys()); // Get indices [0, 1, 2, ...]

  if (groupIndices.length === 0) {
    // No student groups, return rooms as is
    return rooms;
  }

  let totalStudentsToAssign = studentGroups.reduce((sum, group) => sum + group.studentList.length, 0);
  let studentsAssigned = 0;

  // Assign students room by room
  for (const room of rooms) {
    // Iterate column first, then row to fill column-wise
    for (let colIdx = 0; colIdx < room.columns.length; colIdx++) {
      // Determine the target group index for this column
      const targetGroupIndex = groupIndices[colIdx % groupIndices.length];
      const groupStudentList = groupMap.get(targetGroupIndex);
      const columnRowCount = room.columns[colIdx].rowCount;

      for (let rowIdx = 0; rowIdx < columnRowCount; rowIdx++) {
        // Check if there are students left for the target group
        if (groupStudentList && groupStudentList.length > 0) {
          // Assign the next available student ID from that group
          const studentId = groupStudentList.shift(); // Take the first student ID
          room.seatingGrid[rowIdx][colIdx] = studentId!; // Assign ID string
          studentsAssigned++;
        } else {
          // No more students for this group, leave the seat null
          room.seatingGrid[rowIdx][colIdx] = null;
        }
        // Optimization: Check if all students have been assigned.
        if (studentsAssigned >= totalStudentsToAssign) {
          // Exit inner loops if all students are seated
          colIdx = room.columns.length; // This will break the outer col loop
          break; // Exit the row loop
        }
      }
      // Optimization: Check if all students have been assigned.
      if (studentsAssigned >= totalStudentsToAssign) {
        break; // Exit the col loop
      }
    }
    // Optimization: Check if all students have been assigned.
    if (studentsAssigned >= totalStudentsToAssign) {
      break; // Exit the room loop early if all students are seated
    }
  }

  return rooms;
}

/**
 * Creates a seating plan Excel file based on provided options
 *
 * @param options Configuration options for the seating plan
 * @returns Promise that resolves with the path of the created Excel file
 */
function generateSeatingPlan(options: SeatingPlanOptions): Promise<string> {
  // Destructure options
  const { studentGroups, rooms, examConfig } = options;

  // Deep cloning rooms to avoid modifying the originals
  const roomsClone = rooms.map(room => {
    const newRoom = new Room(room.name, room.columns, room.buildingLocation);
    return newRoom;
  });

  // Assign seats using the group-based strategy
  const assignedRooms = assignSeatsByGroup(studentGroups, roomsClone);

  // Create a new workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Seating Plan Generator';
  workbook.lastModifiedBy = 'Seating Plan Generator';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Process each room, creating a separate worksheet for each
  for (let roomIdx = 0; roomIdx < assignedRooms.length; roomIdx++) {
    const room = assignedRooms[roomIdx];
    
    // Create a worksheet for this room
    const worksheet = workbook.addWorksheet(`${room.name}`, {
      pageSetup: {
        paperSize: 9, // A4
        orientation: 'landscape',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 1,
        horizontalCentered: true,
        verticalCentered: false
      }
    });

    // Set column widths - now using the actual number of columns in the room
    const colCount = room.columns.length;
    worksheet.columns = [
      { width: 8 }, // S.No. column
      ...Array(colCount).fill({ width: 15 }) // Columns for student IDs
    ];

    // ==== Header Section ====
    // Title row
    const titleRow = worksheet.addRow(['']);
    titleRow.height = 20;
    
    // Exam details
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `SEATING PLAN FOR ${examConfig.examName}, DATED: ${examConfig.examDate}, TIMINGS: ${examConfig.examTime}`;
    titleCell.font = { bold: true, size: 12 };
    worksheet.mergeCells(1, 1, 1, colCount + 1 + 8);
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    
    // Cloak room info
    const cloakRow = worksheet.addRow(['']);
    cloakRow.height = 20;
    const cloakCell = worksheet.getCell('A2');
    cloakCell.value = `CLOAK ROOM VENUE - ${examConfig.cloakRoom}`;
    cloakCell.font = { bold: true, size: 11 };
    worksheet.mergeCells(2, 1, 2, colCount + 1 + 8);
    cloakCell.alignment = { horizontal: 'center', vertical: 'middle' };
    
    // Instructions header
    const instrHeaderRow = worksheet.addRow(['']);
    instrHeaderRow.height = 20;
    const instrHeaderCell = worksheet.getCell('A3');
    instrHeaderCell.value = "Mandatory Instructions to be announced by the Invigilator(s) to candidates before distribution of the question papers.";
    instrHeaderCell.font = { size: 10, italic: true };
    worksheet.mergeCells(3, 1, 3, colCount + 1 + 8);
    instrHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };
    
    // Instructions
    let currentRow = 4;
    for (const instruction of examConfig.instructions) {
      const instrRow = worksheet.addRow([instruction]);
      instrRow.height = 12; // Reduced row height
      const instrCell = worksheet.getCell(`A${currentRow}`); // Get the cell for styling
      instrCell.font = { size: 9 }; // Set smaller font size
      worksheet.mergeCells(currentRow, 1, currentRow, colCount + 1 + 8);
      currentRow++;
    }
    
    // Room name header
    const roomHeaderRow = worksheet.addRow(['']);
    roomHeaderRow.height = 20;
    currentRow++;
    const roomHeaderCell = worksheet.getCell(`A${currentRow}`);
    roomHeaderCell.value = room.name;
    roomHeaderCell.font = { bold: true, size: 12 };
    worksheet.mergeCells(currentRow, 1, currentRow, colCount + 1);
    roomHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };
    currentRow++;
    
    // Blank row for spacing
    worksheet.addRow([]);
    currentRow++;
    
    // ==== Main Seating Table ====
    // Table Header - First row (Column numbers)
    const tableHeaderRow1 = worksheet.addRow(['S.No.']);
    tableHeaderRow1.height = 20;
    
    for (let col = 0; col < colCount; col++) {
      tableHeaderRow1.getCell(col + 2).value = `Col ${col + 1}`;
      tableHeaderRow1.getCell(col + 2).font = { bold: true };
      tableHeaderRow1.getCell(col + 2).alignment = { horizontal: 'center', vertical: 'middle' };
    }
    
    // Style first header row
    tableHeaderRow1.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' } // Light gray
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    currentRow++;
    
    // Table Header - Second row (Branch codes)
    const tableHeaderRow2 = worksheet.addRow(['']);
    tableHeaderRow2.height = 20;
    
    for (let col = 0; col < colCount; col++) {
      const targetGroupIndex = col % studentGroups.length;
      const group = studentGroups[targetGroupIndex];
      
      tableHeaderRow2.getCell(col + 2).value = group.branchCode;
      tableHeaderRow2.getCell(col + 2).font = { bold: true };
      tableHeaderRow2.getCell(col + 2).alignment = { horizontal: 'center', vertical: 'middle' };
    }
    
    // Style second header row
    tableHeaderRow2.eachCell((cell, colNumber) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' } // Light gray
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    currentRow++;
    
    // Find the maximum row count for this room
    const maxRows = Math.max(...room.columns.map(col => col.rowCount));
    
    // Table Data Rows - now handling variable row counts per column
    for (let rowIdx = 0; rowIdx < maxRows; rowIdx++) {
      const dataRow = worksheet.addRow([rowIdx + 1]);
      dataRow.height = 18;
      
      // Set student IDs
      for (let colIdx = 0; colIdx < colCount; colIdx++) {
        // Only show student ID if this row exists for this column
        const columnRowCount = room.columns[colIdx].rowCount;
        const studentId = rowIdx < columnRowCount ? room.seatingGrid[rowIdx][colIdx] : null;
        dataRow.getCell(colIdx + 2).value = studentId || '---';
        dataRow.getCell(colIdx + 2).alignment = { horizontal: 'center', vertical: 'middle' };
      }
      
      // Style data row
      dataRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      currentRow++;
    }
    
    // Add space before summary
    worksheet.addRow([]);
    currentRow++;
    
    // ==== Summary Table ====
    // Summary header
    const summaryHeaderRow = worksheet.addRow(['Branch', 'Appearing', 'Subject']);
    summaryHeaderRow.height = 20;
    
    // Style summary header
    summaryHeaderRow.eachCell((cell, colNumber) => {
      if (colNumber <= 3) { // Only style the first 3 cells
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' } // Light gray
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });
    currentRow++;
    
    // Summary data rows - one for each student group
    for (const group of studentGroups) {
      // Count appearances for this group in this room
      const groupAppearances = room.seatingGrid.flat()
        .filter(id => id !== null && group.studentList.includes(id)).length;
      
      const summaryDataRow = worksheet.addRow([
        group.branchCode,
        groupAppearances,
        group.subjectCode
      ]);
      
      // Style summary data row
      summaryDataRow.eachCell((cell, colNumber) => {
        if (colNumber <= 3) { // Only style the first 3 cells
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
      });
      currentRow++;
    }
    
    // Total row
    const totalPresent = room.seatingGrid.flat().filter(id => id !== null).length;
    const totalRow = worksheet.addRow(['Total', totalPresent, '']);
    
    // Style total row
    totalRow.eachCell((cell, colNumber) => {
      if (colNumber <= 3) { // Only style the first 3 cells
        cell.font = { bold: true };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });
    currentRow++;
    
    // Add space before footer
    worksheet.addRow([]);
    currentRow++;
    
    // ==== Footer Section ====
    // Footer with signature lines
    const umc = worksheet.addRow(['UMC Roll Number (if any): _____________________________ Absent Roll Number : _____________________________ Remarks: _____________________________']);
    worksheet.mergeCells(currentRow, 1, currentRow, colCount + 1 + 8);
    currentRow++;
    
    const invigilator1 = worksheet.addRow(['Name of the Invigilator - 1: _____________________________ Employee Code: _____________________________ Signature: _____________________________']);
    worksheet.mergeCells(currentRow, 1, currentRow, colCount + 1 + 8);
    currentRow++;
    
    const invigilator2 = worksheet.addRow(['Name of the Invigilator - 2: _____________________________ Employee Code: _____________________________ Signature: _____________________________']);
    worksheet.mergeCells(currentRow, 1, currentRow, colCount + 1 + 8);
  }

  // Write the workbook to file
  return new Promise<string>((resolve, reject) => {
    workbook.xlsx.writeFile(options.outputFile)
      .then(() => {
        resolve(options.outputFile);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// Default exam configuration
function getDefaultExamConfig(): ExamConfig {
  return {
    examName: "END TERM EXAMINATIONS",
    examDate: new Date().toLocaleDateString(),
    examTime: "01:00 p.m. - 04:00 p.m.",
    cloakRoom: "OAT, Ground Floor, Le Corbusier Block",
    instructions: [
      "1. No student should be allowed to leave the Examination Hall before half time.",
      "2. Mobile phones/Smart Watches/Electronic devices are strictly prohibited in examination halls; candidates are strictly banned",
      "   from carrying these devices. If found with any such device, the same shall be confiscated and UMC will be registered.",
      "3. No student is allowed to leave the examination hall before half time.",
      "4. Students without admit card must report to Conduct Branch, Examination Wing (First Floor) with University Identity Card.",
      "5. No student is allowed to carry any paper/book/notes/mobile/calculator etc. inside the examination venue.",
      "6. Students must reach at least 15 minutes before the start of Examination at the respective examination venue."
    ],
  };
}

// Export only what's needed by other modules
export {
  Room,
  generateSeatingPlan,
  getDefaultExamConfig
};

// Example usage function - updated for new room structure
export async function generateExampleSeatingPlanExcel() {
  // Create some example rooms with the new column structure
  const rooms = [
    new Room('DM-101', [
      { rowCount: 3 },
      { rowCount: 4 },
      { rowCount: 4 },
      { rowCount: 2 },
    ], 'DE-MORGAN BLOCK FIRST FLOOR'),
    new Room('DM-102', [
      { rowCount: 7 },
      { rowCount: 5 },
      { rowCount: 4 },
    ], 'DE-MORGAN BLOCK FIRST FLOOR')
  ];

  // Create example student groups
  const studentGroups: StudentGroup[] = [
    {
      branchCode: 'CSE',
      subjectCode: 'CS-101',
      studentList: [
        'CSE001', 'CSE002', 'CSE003', 'CSE004', 'CSE005',
        'CSE006', 'CSE007', 'CSE008', 'CSE009', 'CSE010',
        'CSE011', 'CSE012', 'CSE013', 'CSE014', 'CSE015'
      ]
    },
    {
      branchCode: 'ECE',
      subjectCode: 'EC-101',
      studentList: [
        'ECE001', 'ECE002', 'ECE003', 'ECE004', 'ECE005',
        'ECE006', 'ECE007', 'ECE008', 'ECE009', 'ECE010'
      ]
    },
    {
      branchCode: 'ME',
      subjectCode: 'ME-101',
      studentList: [
        'ME001', 'ME002', 'ME003', 'ME004', 'ME005',
        'ME006', 'ME007', 'ME008', 'ME009', 'ME010'
      ]
    }
  ];

  // Get default exam config
  const examConfig = getDefaultExamConfig();
  
  // Update exam config with specific details
  examConfig.examName = "MID TERM EXAMINATIONS";
  examConfig.examDate = "May 10, 2025";
  examConfig.examTime = "09:30 a.m. - 11:30 a.m.";

  // Create options for generating seating plan
  const options: SeatingPlanOptions = {
    outputFile: 'seating-plan.xlsx',
    examConfig,
    studentGroups,
    rooms
  };

  try {
    // Generate the seating plan Excel file
    const filePath = await generateSeatingPlan(options);
    console.log(`Seating plan generated successfully at: ${filePath}`);
  } catch (error) {
    console.error('Error generating seating plan:', error);
  }
}
