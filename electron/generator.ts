import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Polyfill for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import fs from 'fs';
import PDFDocument from 'pdfkit';

class Student {
  id: string;
  name: string;
  department: string;

  constructor(id: string, name: string, department: string) {
    this.id = id;
    this.name = name;
    this.department = department;
  }
}

class Room {
  name: string;
  rows: number;
  cols: number;
  capacity: number;
  buildingLocation: string;
  seatingGrid: (Student | null)[][];

  constructor(name: string, rows: number, cols: number, buildingLocation: string = "DE-MORGAN BLOCK FIRST FLOOR") {
    this.name = name;
    this.rows = rows;
    this.cols = cols;
    this.capacity = rows * cols;
    this.buildingLocation = buildingLocation;
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
  departmentColors: { [key: string]: string };
  logoPath?: string;
}

export interface SeatingPlanOptions {
  outputFile: string;
  examConfig: ExamConfig;
  students: Student[];
  rooms: Room[];
  assignmentStrategy?: 'byDepartment' | 'random' | 'custom';
}

function assignSeatsByDepartment(students: Student[], rooms: Room[]): Room[] {
  // Clone students array to avoid modifying the original
  const studentsToAssign = [...students];
  
  // Sort students by department
  studentsToAssign.sort((a, b) => a.department.localeCompare(b.department));
  
  let studentIdx = 0;
  for (const room of rooms) {
    for (let row = 0; row < room.rows; row++) {
      // Alternate departments by rows
      const departments = [...new Set(studentsToAssign.map(s => s.department))];
      const rowDepartment = departments[row % departments.length];
      
      for (let col = 0; col < room.cols; col++) {
        if (studentIdx >= studentsToAssign.length) {
          break;
        }
        
        let foundStudent = false;
        for (let i = studentIdx; i < studentsToAssign.length; i++) {
          if (studentsToAssign[i].department === rowDepartment) {
            if (i !== studentIdx) {
              // Swap students to get correct department
              [studentsToAssign[studentIdx], studentsToAssign[i]] = [studentsToAssign[i], studentsToAssign[studentIdx]];
            }
            foundStudent = true;
            break;
          }
        }
        
        if (foundStudent) {
          room.seatingGrid[row][col] = studentsToAssign[studentIdx];
          studentIdx++;
        }
      }
    }
  }
  
  return rooms;
}

function assignSeatsRandomly(students: Student[], rooms: Room[]): Room[] {
  // Clone and shuffle students array
  const studentsToAssign = [...students].sort(() => Math.random() - 0.5);
  
  let studentIdx = 0;
  for (const room of rooms) {
    for (let row = 0; row < room.rows; row++) {
      for (let col = 0; col < room.cols; col++) {
        if (studentIdx < studentsToAssign.length) {
          room.seatingGrid[row][col] = studentsToAssign[studentIdx];
          studentIdx++;
        }
      }
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
  const { students, rooms, examConfig, assignmentStrategy = 'byDepartment' } = options;
  
  // Deep cloning rooms to avoid modifying the originals
  const roomsClone = rooms.map(room => {
    const newRoom = new Room(room.name, room.rows, room.cols, room.buildingLocation);
    return newRoom;
  });
  
  // Assign seats based on selected strategy
  let assignedRooms: Room[];
  if (assignmentStrategy === 'byDepartment') {
    assignedRooms = assignSeatsByDepartment([...students], roomsClone);
  } else if (assignmentStrategy === 'random') {
    assignedRooms = assignSeatsRandomly([...students], roomsClone);
  } else {
    // 'custom' strategy means rooms are already assigned
    assignedRooms = roomsClone;
  }
  
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
    if (examConfig.logoPath) {
      try {
        doc.image(examConfig.logoPath, 20, 20, { width: 40, height: 30 });
      } catch (err) {
        // Skip if image not found
        console.log(`Warning: Logo image not found at ${examConfig.logoPath}`);
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
      
      // Get all departments for proper row coloring
      const departments = [...new Set(students.map(s => s.department))];
      
      // Set background color based on department
      const dept = departments[rowIdx % departments.length];
      const bgColor = colors.HexColor('#FFFFFF');
      
      doc.rect(40, yPos, availableWidth, rowHeight)
         .fillColor(bgColor)
         .fill();
      
      // Draw row number
      doc.fillColor(colors.black)
         .text(`${rowIdx + 1}`, 40 + 5, yPos + 7, { width: colWidth - 10, align: 'center' });
      
      // Draw student IDs
      for (let colIdx = 0; colIdx < colCount; colIdx++) {
        const student = colIdx < room.cols ? room.seatingGrid[rowIdx][colIdx] : null;
        const text = student ? student.id : "---";
        
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
    const presentCount = room.seatingGrid.flat().filter(s => s).length;
    const absentCount = room.capacity - presentCount;
    
    // Header row
    doc.rect(40, summaryStartY, summaryWidth, rowHeight)
       .fillColor(colors.black)
       .fill();
    
    doc.fillColor(colors.white);
    doc.text("ROLL NUMBERS", 40 + 5, summaryStartY + 7, { width: summaryColWidths[0] - 10, align: 'center' });
    doc.text("PRESENT", 40 + summaryColWidths[0] + 5, summaryStartY + 7, 
            { width: summaryColWidths[1] - 10, align: 'center' });
    doc.text("ABSENT", 40 + summaryColWidths[0] + summaryColWidths[1] + 5, summaryStartY + 7, 
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
    let xPos = 40;
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
    departmentColors: {
      "Computer Science": colors.HexColor('#BBDEFB'),
      "Electrical Engineering": colors.HexColor('#FFCDD2')
    }
  };
}

// Export only what's needed by other modules
export {
  Student,
  Room,
  generateSeatingPlan,
  getDefaultExamConfig
};