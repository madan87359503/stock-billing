import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportExcel = (data, name) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  saveAs(new Blob([buf]), `${name}.xlsx`);
};
