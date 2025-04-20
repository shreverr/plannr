
declare global {
    interface Window {
      ipcRenderer: {
        geneateSeatingP: (data: any) => Promise<any>;
      };
    }
  }