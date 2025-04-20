"use client";

import { useState, ChangeEvent } from "react";
import axios from "axios";

interface CSVRow {
  [key: string]: string;
}

export default function CSVUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CSVRow[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      previewCSV(selected);
    }
  };

  const previewCSV = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post<CSVRow[]>(
        "http://localhost:4000/preview",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setPreview(response.data);
    } catch (error) {
      console.error("Preview error:", error);
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
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg mt-12">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">
        Sustainability CSV Upload
      </h2>

      <div className="flex items-center justify-between gap-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-600 
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-lg file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100"
        />
        <button
          onClick={uploadCSV}
          disabled={uploading || !file}
          className={`px-6 py-2 rounded-lg font-semibold transition duration-200 ${
            uploading || !file
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {preview.length > 0 && (
        <div className="mt-6 overflow-auto max-h-[400px] border rounded-lg">
          <table className="table-auto w-full text-sm text-left text-slate-600 border-collapse">
            <thead className="bg-slate-100 sticky top-0 shadow text-slate-800">
              <tr>
                {Object.keys(preview[0]).map((key) => (
                  <th key={key} className="border px-3 py-2 font-semibold">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} className="even:bg-slate-50 hover:bg-slate-100">
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="border px-3 py-2">
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
