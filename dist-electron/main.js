var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { app, BrowserWindow, ipcMain } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath as fileURLToPath$1 } from "node:url";
import path$1 from "node:path";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import fs from "fs";
import PDFDocument from "pdfkit";
const __filename = fileURLToPath(import.meta.url);
dirname(__filename);
class Student {
  constructor(id, name, department) {
    __publicField(this, "id");
    __publicField(this, "name");
    __publicField(this, "department");
    this.id = id;
    this.name = name;
    this.department = department;
  }
}
class Room {
  constructor(name, rows, cols, buildingLocation = "DE-MORGAN BLOCK FIRST FLOOR") {
    __publicField(this, "name");
    __publicField(this, "rows");
    __publicField(this, "cols");
    __publicField(this, "capacity");
    __publicField(this, "buildingLocation");
    __publicField(this, "seatingGrid");
    this.name = name;
    this.rows = rows;
    this.cols = cols;
    this.capacity = rows * cols;
    this.buildingLocation = buildingLocation;
    this.seatingGrid = Array(rows).fill(null).map(() => Array(cols).fill(null));
  }
}
const colors = {
  black: "#000000",
  white: "#FFFFFF",
  HexColor: (hex) => hex
};
function assignSeatsByDepartment(students, rooms) {
  const studentsToAssign = [...students];
  studentsToAssign.sort((a, b) => a.department.localeCompare(b.department));
  let studentIdx = 0;
  for (const room of rooms) {
    for (let row = 0; row < room.rows; row++) {
      const departments = [...new Set(studentsToAssign.map((s) => s.department))];
      const rowDepartment = departments[row % departments.length];
      for (let col = 0; col < room.cols; col++) {
        if (studentIdx >= studentsToAssign.length) {
          break;
        }
        let foundStudent = false;
        for (let i = studentIdx; i < studentsToAssign.length; i++) {
          if (studentsToAssign[i].department === rowDepartment) {
            if (i !== studentIdx) {
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
function assignSeatsRandomly(students, rooms) {
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
function generateSeatingPlan(options) {
  const { students, rooms, examConfig, assignmentStrategy = "byDepartment" } = options;
  const roomsClone = rooms.map((room) => {
    const newRoom = new Room(room.name, room.rows, room.cols, room.buildingLocation);
    return newRoom;
  });
  let assignedRooms;
  if (assignmentStrategy === "byDepartment") {
    assignedRooms = assignSeatsByDepartment([...students], roomsClone);
  } else if (assignmentStrategy === "random") {
    assignedRooms = assignSeatsRandomly([...students], roomsClone);
  } else {
    assignedRooms = roomsClone;
  }
  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 20 });
  const stream = fs.createWriteStream(options.outputFile);
  doc.pipe(stream);
  const pageWidth = doc.page.width;
  let pageNumber = 1;
  const drawHeader = () => {
    doc.fontSize(8).text(`Page No.: ${pageNumber}`, pageWidth - 100, 20, { align: "right" });
    pageNumber++;
    {
      try {
        doc.image(path.join(process.env.VITE_PUBLIC, "./image.png"), 20, 20, { width: 40, height: 30 });
      } catch (err) {
        console.log(`Warning: image image not found at ${path.join(process.env.VITE_PUBLIC, "./image.png")}`);
      }
    }
    const centerX = pageWidth / 2;
    let yPos = 40;
    doc.font("Helvetica-Bold").fontSize(11).fillColor(colors.black);
    const title = `SEATING PLAN FOR ${examConfig.examName}, DATED: ${examConfig.examDate}, TIMINGS: ${examConfig.examTime}`;
    doc.text(title, centerX - doc.widthOfString(title) / 2, yPos);
    yPos += 15;
    const cloakText = `CLOAK ROOM VENUE - ${examConfig.cloakRoom}`;
    doc.text(cloakText, centerX - doc.widthOfString(cloakText) / 2, yPos);
    yPos += 25;
    doc.fontSize(10);
    const instrHeader = "Mandatory Instructions to be announced by the Invigilator(s) to candidates before distribution of the question papers.";
    doc.text(instrHeader, centerX - doc.widthOfString(instrHeader) / 2, yPos);
    doc.fontSize(8);
    yPos += 15;
    for (const line of examConfig.instructions) {
      doc.text(line, 40, yPos);
      yPos += 12;
    }
    return yPos + 20;
  };
  for (let roomIdx = 0; roomIdx < assignedRooms.length; roomIdx++) {
    if (roomIdx > 0) {
      doc.addPage();
    }
    const room = assignedRooms[roomIdx];
    const startY = drawHeader();
    doc.font("Helvetica-Bold").fontSize(9).fillColor(colors.black);
    const roomHeader = `${room.name} - ${room.buildingLocation}`;
    const roomTitleWidth = doc.widthOfString(roomHeader);
    doc.text(roomHeader, (pageWidth - roomTitleWidth) / 2, startY);
    const colCount = Math.min(room.cols, 10);
    const availableWidth = pageWidth - 80;
    const colWidth = availableWidth / (colCount + 1);
    let tableStartY = startY + 30;
    const rowHeight = 15;
    doc.rect(40, tableStartY, availableWidth, rowHeight).fill(colors.white);
    doc.fillColor(colors.black);
    doc.text("S.No.", 40 + 5, tableStartY + 7, { width: colWidth - 10, align: "center" });
    for (let col = 0; col < colCount; col++) {
      doc.text(
        `Col ${col + 1}`,
        40 + colWidth + col * colWidth + 5,
        tableStartY + 7,
        { width: colWidth - 10, align: "center" }
      );
    }
    for (let rowIdx = 0; rowIdx < room.rows; rowIdx++) {
      const yPos = tableStartY + (rowIdx + 1) * rowHeight;
      [...new Set(students.map((s) => s.department))];
      const bgColor = colors.HexColor("#FFFFFF");
      doc.rect(40, yPos, availableWidth, rowHeight).fillColor(bgColor).fill();
      doc.fillColor(colors.black).text(`${rowIdx + 1}`, 40 + 5, yPos + 7, { width: colWidth - 10, align: "center" });
      for (let colIdx = 0; colIdx < colCount; colIdx++) {
        const student = colIdx < room.cols ? room.seatingGrid[rowIdx][colIdx] : null;
        const text = student ? student.id : "---";
        doc.text(
          text,
          40 + colWidth + colIdx * colWidth + 5,
          yPos + 7,
          { width: colWidth - 10, align: "center" }
        );
      }
      doc.strokeColor(colors.black);
      for (let colIdx = 0; colIdx <= colCount; colIdx++) {
        const x = 40 + colIdx * colWidth;
        doc.moveTo(x, tableStartY).lineTo(x, yPos + rowHeight).stroke();
      }
      doc.moveTo(40, yPos).lineTo(40 + availableWidth, yPos).stroke();
    }
    const tableEndY = tableStartY + (room.rows + 1) * rowHeight;
    doc.moveTo(40, tableEndY).lineTo(40 + availableWidth, tableEndY).stroke();
    doc.rect(40, tableStartY, availableWidth, (room.rows + 1) * rowHeight).lineWidth(1).stroke();
    const summaryStartY = tableEndY + 30;
    const summaryColWidths = [120, 60, 60];
    const summaryWidth = summaryColWidths.reduce((a, b) => a + b, 0);
    const presentCount = room.seatingGrid.flat().filter((s) => s).length;
    const absentCount = room.capacity - presentCount;
    doc.rect(40, summaryStartY, summaryWidth, rowHeight).fillColor(colors.white).fill();
    doc.fillColor(colors.black).fontSize(9);
    doc.text("Branch", 40 + 5, summaryStartY + 7, { width: summaryColWidths[0] - 10, align: "center" });
    doc.text(
      "Appearing",
      40 + summaryColWidths[0] + 5,
      summaryStartY + 7,
      { width: summaryColWidths[1] - 10, align: "center" }
    );
    doc.text(
      "Subject",
      40 + summaryColWidths[0] + summaryColWidths[1] + 5,
      summaryStartY + 7,
      { width: summaryColWidths[2] - 10, align: "center" }
    );
    doc.rect(40, summaryStartY + rowHeight, summaryWidth, rowHeight * 2).fillColor(colors.white).fill();
    doc.fillColor(colors.black);
    doc.text(
      "ENROLLED",
      40 + 5,
      summaryStartY + rowHeight + 7,
      { width: summaryColWidths[0] - 10, align: "center" }
    );
    doc.text(
      `${room.capacity}`,
      40 + summaryColWidths[0] + 5,
      summaryStartY + rowHeight + 7,
      { width: summaryColWidths[1] - 10, align: "center" }
    );
    doc.text(
      `${absentCount}`,
      40 + summaryColWidths[0] + summaryColWidths[1] + 5,
      summaryStartY + rowHeight + 7,
      { width: summaryColWidths[2] - 10, align: "center" }
    );
    doc.text(
      "APPEARED",
      40 + 5,
      summaryStartY + rowHeight * 2 + 7,
      { width: summaryColWidths[0] - 10, align: "center" }
    );
    doc.text(
      `${presentCount}`,
      40 + summaryColWidths[0] + 5,
      summaryStartY + rowHeight * 2 + 7,
      { width: summaryColWidths[1] - 10, align: "center" }
    );
    doc.strokeColor(colors.black);
    let xPos = 40;
    doc.moveTo(xPos, summaryStartY).lineTo(xPos, summaryStartY + rowHeight * 3).stroke();
    for (const width of summaryColWidths) {
      xPos += width;
      doc.moveTo(xPos, summaryStartY).lineTo(xPos, summaryStartY + rowHeight * 3).stroke();
    }
    for (let i = 0; i <= 3; i++) {
      const y = summaryStartY + i * rowHeight;
      doc.moveTo(40, y).lineTo(40 + summaryWidth, y).stroke();
    }
    let footerY = summaryStartY + rowHeight * 3 + 30;
    doc.fontSize(9);
    doc.text(
      "UMC Roll Number (if any): _____________________________ Absent Roll Number : _____________________________ Remarks: _____________________________",
      40,
      footerY
    );
    footerY += 20;
    doc.text(
      "Name of the Invigilator - 1: _____________________________ Employee Code: _____________________________ Signature: _____________________________",
      40,
      footerY
    );
    footerY += 15;
    doc.text(
      "Name of the Invigilator - 2: _____________________________ Employee Code: _____________________________ Signature: _____________________________",
      40,
      footerY
    );
  }
  doc.end();
  return new Promise((resolve) => {
    stream.on("finish", () => {
      resolve(options.outputFile);
    });
  });
}
createRequire(import.meta.url);
const __dirname = path$1.dirname(fileURLToPath$1(import.meta.url));
process.env.APP_ROOT = path$1.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path$1.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path$1.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path$1.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
async function exampleUsage() {
  const examConfig = {
    examName: "END TERM EXAMINATIONS - SPRING 2025",
    examDate: "20/04/2025",
    examTime: "09:00 a.m. - 12:00 p.m.",
    cloakRoom: "OAT, Ground Floor, Le Corbusier Block",
    instructions: [
      "1. No student should be allowed to leave the Examination Hall before half time.",
      "2. Mobile phones/Smart Watches/Electronic devices are strictly prohibited in examination halls.",
      "3. Students without admit card must report to Examination Wing with University Identity Card.",
      "4. No student is allowed to carry any paper/book/notes/mobile/calculator inside the examination venue.",
      "5. Students must reach at least 15 minutes before the start of Examination."
    ],
    departmentColors: {
      "Computer Science": "#BBDEFB",
      "Electrical Engineering": "#FFCDD2",
      "Mechanical Engineering": "#C8E6C9"
    },
    logoPath: "./university_logo.png"
    // Optional
  };
  const rooms = [
    new Room("Room A101", 5, 6, "DE-MORGAN BLOCK FIRST FLOOR"),
    new Room("Room B202", 6, 5, "LE CORBUSIER BLOCK SECOND FLOOR")
  ];
  const students = [];
  const departments = ["Computer Science", "Electrical Engineering", "Mechanical Engineering"];
  for (let i = 1; i <= 50; i++) {
    const studentId = `${i}`;
    const name = `Student ${i}`;
    const department = departments[i % departments.length];
    students.push(new Student(studentId, name, department));
  }
  try {
    console.log(students);
    const outputFile = await generateSeatingPlan({
      outputFile: `./SeatingPlan_${(/* @__PURE__ */ new Date()).toISOString().replace(/[T:.-]/g, "").slice(0, 14)}.pdf`,
      examConfig,
      students,
      rooms,
      assignmentStrategy: "byDepartment"
    });
    console.log(`Seating plan generated successfully: ${outputFile}`);
  } catch (err) {
    console.error("Error generating PDF:", err);
  }
}
function createWindow() {
  win = new BrowserWindow({
    icon: path$1.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path$1.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path$1.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
ipcMain.handle("generate-seating-plan", async (event, arg) => {
  const result = exampleUsage();
  return result;
});
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
