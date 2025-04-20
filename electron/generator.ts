// import { fileURLToPath } from 'url';
import path from 'path';

// // Polyfill for __dirname in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

import fs from 'fs';
import PDFDocument from 'pdfkit';

class Room {
  name: string;
  rows: number;
  cols: number;
  capacity: number;
  buildingLocation: string;
  seatingGrid: (string | null)[][]; // Changed to store student IDs (string)

  constructor(name: string, rows: number, cols: number, buildingLocation: string = "DE-MORGAN BLOCK FIRST FLOOR") {
    this.name = name;
    this.rows = rows;
    this.cols = cols;
    this.capacity = rows * cols;
    this.buildingLocation = buildingLocation;
    // Initialize grid with nulls
    this.seatingGrid = Array(rows).fill(null).map(() => Array(cols).fill(null));
  }
}

interface Colors {
  black: string;
  white: string;
  HexColor: (hex: string) => string;
}

const colors: Colors = {
  black: '#000000',
  white: '#FFFFFF',
  HexColor: (hex: string) => hex,
};

export interface ExamConfig {
  examName: string;
  examDate: string;
  examTime: string;
  cloakRoom: string;
  instructions: string[];
  // departmentColors: { [key: string]: string }; // Removed departmentColors
  logoPath?: string;
}

// Define the new structure for student input
export interface StudentGroup {
  branchCode: string; // Identifier for the group
  subjectCode: string; // Another identifier
  studentList: string[]; // List of student IDs
}

export interface SeatingPlanOptions {
  outputFile: string;
  examConfig: ExamConfig;
  studentGroups: StudentGroup[]; // Changed from students: Student[]
  rooms: Room[];
}

// Renamed and modified function to assign seats based on StudentGroup
function assignSeatsByGroup(studentGroups: StudentGroup[], rooms: Room[]): Room[] {
  // Create a copy of the student lists within each group to avoid modifying the original input
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
    for (let col = 0; col < room.cols; col++) {
      // Determine the target group index for this column
      const targetGroupIndex = groupIndices[col % groupIndices.length];
      const groupStudentList = groupMap.get(targetGroupIndex);

      for (let row = 0; row < room.rows; row++) {
        // Check if there are students left for the target group
        if (groupStudentList && groupStudentList.length > 0) {
          // Assign the next available student ID from that group
          const studentId = groupStudentList.shift(); // Take the first student ID
          room.seatingGrid[row][col] = studentId!; // Assign ID string
          studentsAssigned++;
        } else {
          // No more students for this group, leave the seat null
          room.seatingGrid[row][col] = null;
        }
         // Optimization: Check if all students have been assigned.
         if (studentsAssigned >= totalStudentsToAssign) {
             // Exit inner loops if all students are seated
             col = room.cols; // This will break the outer col loop
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
 * Creates a seating plan PDF based on provided options
 *
 * @param options Configuration options for the seating plan
 * @returns Promise that resolves with the path of the created PDF file
 */
function generateSeatingPlan(options: SeatingPlanOptions): Promise<string> {
  // Destructure studentGroups instead of students
  const { studentGroups, rooms, examConfig } = options;

  // Deep cloning rooms to avoid modifying the originals
  const roomsClone = rooms.map(room => {
    // Use the updated Room constructor
    const newRoom = new Room(room.name, room.rows, room.cols, room.buildingLocation);
    return newRoom;
  });

  // Assign seats using the new group-based strategy
  const assignedRooms = assignSeatsByGroup(studentGroups, roomsClone);

  // Initialize the PDF
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 20 });
  
  // Create a write stream to the output file
  const stream = fs.createWriteStream(options.outputFile);
  doc.pipe(stream);
  
  // Calculate page dimensions for convenience
  const pageWidth = doc.page.width;
  
  let pageNumber = 1;
  
  // Function to draw the header on each page
  const drawHeader = () => {
    // Page number in top right
    doc.fontSize(8)
       .text(`Page No.: ${pageNumber}`, pageWidth - 100, 20, { align: 'right' });
    pageNumber++;
    
    // Try to add logo if exists
    if (true) {
      try {
        doc.image(path.join(process.env.VITE_PUBLIC, './image.png'), 20, 20, { width: 40, height: 30 });
      } catch (err) {
        // Skip if image not found
        console.log(`Warning: image image not found at ${path.join(process.env.VITE_PUBLIC, './image.png')}`);
      }
    }
    
    // Center coordinates
    const centerX = pageWidth / 2;
    let yPos = 40;
    
    // Main Header - ALL CAPS, centered with exam name
    doc.font('Helvetica-Bold')
       .fontSize(11)
       .fillColor(colors.black);
    
    const title = `SEATING PLAN FOR ${examConfig.examName}, DATED: ${examConfig.examDate}, TIMINGS: ${examConfig.examTime}`;
    doc.text(title, centerX - doc.widthOfString(title) / 2, yPos);
    
    // Cloak Room info
    yPos += 15;
    const cloakText = `CLOAK ROOM VENUE - ${examConfig.cloakRoom}`;
    doc.text(cloakText, centerX - doc.widthOfString(cloakText) / 2, yPos);
    
    // Mandatory Instructions header
    yPos += 25;
    doc.fontSize(10);
    const instrHeader = "Mandatory Instructions to be announced by the Invigilator(s) to candidates before distribution of the question papers.";
    doc.text(instrHeader, centerX - doc.widthOfString(instrHeader) / 2, yPos);
    
    // Instructions in single column format with proper spacing
    doc.fontSize(8);
    yPos += 15;
    for (const line of examConfig.instructions) {
      doc.text(line, 40, yPos);
      yPos += 12;  // Space between lines
    }
    
    return yPos + 20; // Return the new Y position after the header
  };
  
  // Process each room
  for (let roomIdx = 0; roomIdx < assignedRooms.length; roomIdx++) {
    if (roomIdx > 0) {
      doc.addPage();
    }
    
    const room = assignedRooms[roomIdx];
    
    // Draw header
    const startY = drawHeader();
    
    // Room header
    doc.font('Helvetica-Bold')
       .fontSize(9)
       .fillColor(colors.black);
    
    const roomHeader = `${room.name} - ${room.buildingLocation}`;
    const roomTitleWidth = doc.widthOfString(roomHeader);
    doc.text(roomHeader, (pageWidth - roomTitleWidth) / 2, startY);
    
    // Calculate table dimensions
    const colCount = Math.min(room.cols, 10);  // Limit columns to prevent overflow
    const availableWidth = pageWidth - 80;     // Account for margins
    const colWidth = availableWidth / (colCount + 1);  // +1 for S.No. column
    
    // Prepare for table
    let tableStartY = startY + 30;  // Space after room title
    const rowHeight = 15;
    
    // Draw table header
    doc.rect(40, tableStartY, availableWidth, rowHeight)
       .fill(colors.white);
    
    // Table header text
    doc.fillColor(colors.black);
    
    // Draw S.No. cell
    doc.text("S.No.", 40 + 5, tableStartY + 7, { width: colWidth - 10, align: 'center' });
    
    // Draw column headers
    for (let col = 0; col < colCount; col++) {
      doc.text(`Col ${col + 1}`, 40 + colWidth + (col * colWidth) + 5, tableStartY + 7, 
              { width: colWidth - 10, align: 'center' });
    }
    
    // Draw table data rows
    for (let rowIdx = 0; rowIdx < room.rows; rowIdx++) {
      const yPos = tableStartY + (rowIdx + 1) * rowHeight;
      
      // Removed department-based row coloring logic
      const bgColor = colors.white; // Use plain white background

      doc.rect(40, yPos, availableWidth, rowHeight)
         .fillColor(bgColor)
         .fill();

      // Draw row number
      doc.fillColor(colors.black)
         .text(`${rowIdx + 1}`, 40 + 5, yPos + 7, { width: colWidth - 10, align: 'center' });

      // Draw student IDs directly from the grid
      for (let colIdx = 0; colIdx < colCount; colIdx++) {
        // Get the student ID string or null from the grid
        const studentId = colIdx < room.cols ? room.seatingGrid[rowIdx][colIdx] : null;
        // Use the ID if present, otherwise "---"
        const text = studentId ? studentId : "---";

        doc.text(text, 40 + colWidth + (colIdx * colWidth) + 5, yPos + 7,
                { width: colWidth - 10, align: 'center' });
      }

      // Draw cell borders
      doc.strokeColor(colors.black);
      for (let colIdx = 0; colIdx <= colCount; colIdx++) {
        const x = 40 + colIdx * colWidth;
        doc.moveTo(x, tableStartY)
           .lineTo(x, yPos + rowHeight)
           .stroke();
      }
      
      // Draw horizontal line
      doc.moveTo(40, yPos)
         .lineTo(40 + availableWidth, yPos)
         .stroke();
    }
    
    // Bottom line of the table
    const tableEndY = tableStartY + (room.rows + 1) * rowHeight;
    doc.moveTo(40, tableEndY)
       .lineTo(40 + availableWidth, tableEndY)
       .stroke();
    
    // Draw outline around the entire table
    doc.rect(40, tableStartY, availableWidth, (room.rows + 1) * rowHeight)
       .lineWidth(1)
       .stroke();
    
    // Summary table
    const summaryStartY = tableEndY + 30;
    const summaryColWidths = [120, 60, 60];
    const summaryWidth = summaryColWidths.reduce((a, b) => a + b, 0);
    
    // Create summary table
    const presentCount = room.seatingGrid.flat().filter(id => id !== null).length;
    const absentCount = room.capacity - presentCount;
    
    // Header row
    doc.rect(40, summaryStartY, summaryWidth, rowHeight)
       .fillColor(colors.white)
       .fill();
    
    doc.fillColor(colors.black)
       .fontSize(9);  // Set font size to 9 for the summary table
    
    doc.text("Branch", 40 + 5, summaryStartY + 7, { width: summaryColWidths[0] - 10, align: 'center' });
    doc.text("Appearing", 40 + summaryColWidths[0] + 5, summaryStartY + 7,
            { width: summaryColWidths[1] - 10, align: 'center' });
    doc.text("Subject", 40 + summaryColWidths[0] + summaryColWidths[1] + 5, summaryStartY + 7,
            { width: summaryColWidths[2] - 10, align: 'center' });
    
    // Data rows
    doc.rect(40, summaryStartY + rowHeight, summaryWidth, rowHeight * 2)
       .fillColor(colors.white)
       .fill();
    
    doc.fillColor(colors.black);
    
    // Row 1
    doc.text("ENROLLED", 40 + 5, summaryStartY + rowHeight + 7,
            { width: summaryColWidths[0] - 10, align: 'center' });
    doc.text(`${room.capacity}`, 40 + summaryColWidths[0] + 5, summaryStartY + rowHeight + 7,
            { width: summaryColWidths[1] - 10, align: 'center' });
    doc.text(`${absentCount}`, 40 + summaryColWidths[0] + summaryColWidths[1] + 5, summaryStartY + rowHeight + 7,
            { width: summaryColWidths[2] - 10, align: 'center' });
    
    // Row 2
    doc.text("APPEARED", 40 + 5, summaryStartY + rowHeight * 2 + 7,
            { width: summaryColWidths[0] - 10, align: 'center' });
    doc.text(`${presentCount}`, 40 + summaryColWidths[0] + 5, summaryStartY + rowHeight * 2 + 7,
            { width: summaryColWidths[1] - 10, align: 'center' });
    
    // Draw summary table grid lines
    doc.strokeColor(colors.black);
    
    // Vertical lines
    let xPos = 40; // Starting position
    
    // Draw the leftmost vertical line first
    doc.moveTo(xPos, summaryStartY)
       .lineTo(xPos, summaryStartY + rowHeight * 3)
       .stroke();
    
    // Then draw the remaining vertical lines
    for (const width of summaryColWidths) {
      xPos += width;
      doc.moveTo(xPos, summaryStartY)
         .lineTo(xPos, summaryStartY + rowHeight * 3)
         .stroke();
    }
    
    // Horizontal lines
    for (let i = 0; i <= 3; i++) {
      const y = summaryStartY + i * rowHeight;
      doc.moveTo(40, y)
         .lineTo(40 + summaryWidth, y)
         .stroke();
    }
    
    // Footer with signature lines
    let footerY = summaryStartY + rowHeight * 3 + 30;
    
    doc.fontSize(9);
    doc.text("UMC Roll Number (if any): _____________________________ Absent Roll Number : _____________________________ Remarks: _____________________________",
            40, footerY);
    footerY += 20;
    doc.text("Name of the Invigilator - 1: _____________________________ Employee Code: _____________________________ Signature: _____________________________",
            40, footerY);
    footerY += 15;
    doc.text("Name of the Invigilator - 2: _____________________________ Employee Code: _____________________________ Signature: _____________________________",
            40, footerY);
  }
  
  // Finalize the PDF
  doc.end();
  
  return new Promise((resolve) => {
    stream.on('finish', () => {
      resolve(options.outputFile);
    });
  });
}

// Usage example function - you can remove this if not needed
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
    // Removed departmentColors
  };
}

// Export only what's needed by other modules
export {
  // Student, // Removed Student export
  Room,
  generateSeatingPlan,
  getDefaultExamConfig
};