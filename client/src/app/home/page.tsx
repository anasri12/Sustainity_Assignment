import CSVUploader from "@/components/CSVUploader";

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Sustainity Data Uploader</h1>
      <CSVUploader />
    </main>
  );
}
