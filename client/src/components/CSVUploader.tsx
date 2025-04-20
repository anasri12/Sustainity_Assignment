"use client";

import { useState, ChangeEvent } from "react";
import axios from "axios";

interface MappingRow {
  original: string;
  mappedTo: string;
}

interface CSVRow {
  [key: string]: string;
}

interface ProcessResponse {
  saved: number;
  errors: { index: number; reason: string }[];
}

const databaseFields = [
  "brand",
  "description",
  "price",
  "volume",
  "classification",
  "vendorNumber",
  "vendorName",
];

export default function CSVUploadWithMapping() {
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [preview, setPreview] = useState<CSVRow[]>([]);
  const [mapping, setMapping] = useState<MappingRow[]>([]);
  const [saved, setSaved] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ index: number; reason: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", selected);

    try {
      const response = await axios.post<CSVRow[]>(
        "http://localhost:4000/preview",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const headers = Object.keys(response.data[0]);
      setPreview(response.data);
      setMapping(headers.map((h) => ({ original: h, mappedTo: "" })));
    } catch (error) {
      alert("Failed to preview file");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMapChange = (index: number, value: string) => {
    setMapping((prev) => {
      const updated = [...prev];
      updated[index].mappedTo = value;
      return updated;
    });
  };

  const uploadAndSaveMapping = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await axios.post<{ filename: string }>(
        "http://localhost:4000/upload",
        formData
      );
      const uploadedFilename = uploadRes.data.filename;
      setFilename(uploadedFilename);

      await axios.post("http://localhost:4000/mapping", {
        filename: uploadedFilename,
        mapping,
      });
      alert("Mapping saved!");
    } catch (err) {
      console.error("Mapping error:", err);
      alert("Failed to upload or save mapping");
    }
  };

  const processFile = async () => {
    if (!filename) return;

    try {
      const res = await axios.post<ProcessResponse>(
        "http://localhost:4000/process",
        { filename }
      );
      setSaved(res.data.saved);
      setErrors(res.data.errors);
    } catch (err) {
      alert("Processing failed");
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-8 bg-white text-black rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">📁 Upload & Map CSV Columns</h1>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-4 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      {loading && <p className="text-sm">Loading preview...</p>}

      {preview.length > 0 && (
        <>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">🔗 Column Mapping</h2>
            {mapping.map((m, i) => (
              <div key={i} className="flex gap-2 mb-2 items-center">
                <span className="w-1/3 text-sm font-medium">{m.original}</span>
                <select
                  className="w-2/3 border border-slate-300 rounded px-3 py-1 text-sm text-black"
                  value={m.mappedTo}
                  onChange={(e) => handleMapChange(i, e.target.value)}
                >
                  <option value="">Select field...</option>
                  {databaseFields.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <div className="mt-4 flex gap-4">
              <button
                onClick={uploadAndSaveMapping}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                📤 Upload & Save Mapping
              </button>
              <button
                onClick={processFile}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                ⚙️ Process File
              </button>
            </div>
          </div>

          <div className="overflow-auto border rounded-lg max-h-[300px] text-sm">
            <table className="table-auto w-full border-collapse">
              <thead className="bg-slate-100">
                <tr>
                  {Object.keys(preview[0]).map((key) => (
                    <th
                      key={key}
                      className="border px-3 py-2 text-left font-medium"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="even:bg-slate-50 hover:bg-slate-100">
                    {Object.values(row).map((val, j) => (
                      <td
                        key={j}
                        className="border px-3 py-1 whitespace-nowrap text-black"
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {saved !== null && (
        <div className="mt-6">
          <p className="text-green-700 font-semibold">
            ✅ {saved} records saved successfully!
          </p>
          {errors.length > 0 && (
            <div className="mt-2">
              <p className="text-red-600 font-semibold">
                ⚠️ {errors.length} errors found:
              </p>
              <ul className="list-disc list-inside text-sm">
                {errors.map((e, idx) => (
                  <li key={idx}>
                    Row {e.index}: {e.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
