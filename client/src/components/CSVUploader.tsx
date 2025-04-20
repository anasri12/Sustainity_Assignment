"use client";
import { useState, ChangeEvent } from "react";
import axios from "axios";

interface CSVRow {
  [key: string]: string; // Assumes all values in preview rows are strings
}

export default function CSVUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CSVRow[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      previewCSV(selectedFile);
    }
  };

  const previewCSV = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post<CSVRow[]>(
        "http://localhost:4000/preview",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setPreview(response.data);
    } catch (error) {
      console.error("Error previewing CSV:", error);
    }
  };

  const uploadCSV = async () => {
    if (!file) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      await axios.post("http://localhost:4000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Upload successful!");
    } catch (error) {
      console.error("Error uploading CSV:", error);
      alert("Upload failed. Check the console for more details.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded max-w-xl mx-auto">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-2"
      />

      {preview.length > 0 && (
        <div className="overflow-auto border rounded my-2 max-h-64 text-sm">
          <table className="table-auto w-full">
            <thead>
              <tr>
                {Object.keys(preview[0]).map((key) => (
                  <th key={key} className="border px-2 py-1">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.values(row).map((value, colIndex) => (
                    <td key={colIndex} className="border px-2 py-1">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={uploadCSV}
        disabled={uploading || !file}
        className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
      >
        {uploading ? "Uploading..." : "Upload CSV"}
      </button>
    </div>
  );
}
