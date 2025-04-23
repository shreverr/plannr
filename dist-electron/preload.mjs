"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  },
  generateSeatingP: (data) => electron.ipcRenderer.invoke("generate-seating-plan", data),
  // You can expose other APTs you need here.
  generateAttendaceS: (data) => electron.ipcRenderer.invoke("generate-attendance-sheet", data),
  countStudents: (data) => electron.ipcRenderer.invoke("count-students", data)
  // ...
});
console.log("Preload loaded");
