var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { app, BrowserWindow, ipcMain } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path$1 from "node:path";
import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit";
class Room {
  // Changed to store student IDs (string)
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
  white: "#FFFFFF"
};
function assignSeatsByGroup(studentGroups, rooms) {
  const groupMap = /* @__PURE__ */ new Map();
  studentGroups.forEach((group, index) => {
    groupMap.set(index, [...group.studentList]);
  });
  const groupIndices = Array.from(groupMap.keys());
  if (groupIndices.length === 0) {
    return rooms;
  }
  let totalStudentsToAssign = studentGroups.reduce((sum, group) => sum + group.studentList.length, 0);
  let studentsAssigned = 0;
  for (const room of rooms) {
    for (let col = 0; col < room.cols; col++) {
      const targetGroupIndex = groupIndices[col % groupIndices.length];
      const groupStudentList = groupMap.get(targetGroupIndex);
      for (let row = 0; row < room.rows; row++) {
        if (groupStudentList && groupStudentList.length > 0) {
          const studentId = groupStudentList.shift();
          room.seatingGrid[row][col] = studentId;
          studentsAssigned++;
        } else {
          room.seatingGrid[row][col] = null;
        }
        if (studentsAssigned >= totalStudentsToAssign) {
          col = room.cols;
          break;
        }
      }
      if (studentsAssigned >= totalStudentsToAssign) {
        break;
      }
    }
    if (studentsAssigned >= totalStudentsToAssign) {
      break;
    }
  }
  return rooms;
}
function generateSeatingPlan(options) {
  const { studentGroups, rooms, examConfig } = options;
  const roomsClone = rooms.map((room) => {
    const newRoom = new Room(room.name, room.rows, room.cols, room.buildingLocation);
    return newRoom;
  });
  const assignedRooms = assignSeatsByGroup(studentGroups, roomsClone);
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
      const bgColor = colors.white;
      doc.rect(40, yPos, availableWidth, rowHeight).fillColor(bgColor).fill();
      doc.fillColor(colors.black).text(`${rowIdx + 1}`, 40 + 5, yPos + 7, { width: colWidth - 10, align: "center" });
      for (let colIdx = 0; colIdx < colCount; colIdx++) {
        const studentId = colIdx < room.cols ? room.seatingGrid[rowIdx][colIdx] : null;
        const text = studentId ? studentId : "---";
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
    const presentCount = room.seatingGrid.flat().filter((id) => id !== null).length;
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
const __dirname = path$1.dirname(fileURLToPath(import.meta.url));
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
    // departmentColors removed
    logoPath: path$1.join(process.env.VITE_PUBLIC, "electron-vite.svg")
    // Optional - Use a valid path if needed
  };
  const rooms = [
    new Room("Room A101", 5, 6, "DE-MORGAN BLOCK FIRST FLOOR"),
    new Room("Room B202", 6, 5, "LE CORBUSIER BLOCK SECOND FLOOR")
  ];
  const studentGroups = [
    {
      branchCode: "CS",
      subjectCode: "CS101",
      studentList: Array.from({ length: 25 }, (_, i) => `CS${101 + i}`)
      // Generate 25 CS students
    },
    {
      branchCode: "EE",
      subjectCode: "EE201",
      studentList: Array.from({ length: 20 }, (_, i) => `EE${201 + i}`)
      // Generate 20 EE students
    },
    {
      branchCode: "ME",
      subjectCode: "ME301",
      studentList: Array.from({ length: 15 }, (_, i) => `ME${301 + i}`)
      // Generate 15 ME students
    }
  ];
  try {
    const outputFile = await generateSeatingPlan({
      outputFile: `./SeatingPlan_${(/* @__PURE__ */ new Date()).toISOString().replace(/[T:.-]/g, "").slice(0, 14)}.pdf`,
      examConfig,
      studentGroups,
      // Use the new studentGroups array
      rooms
    });
    console.log(`Seating plan generated successfully: ${outputFile}`);
    return outputFile;
  } catch (err) {
    console.error("Error generating PDF:", err);
    throw err;
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
  try {
    const result = await exampleUsage();
    return { success: true, path: result };
  } catch (error) {
    console.error("IPC Handler Error:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
});
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
