import UploadCard from "@/components/UploadCard";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute>
      <main>
        <div className="container py-8">
          {/* Upload Section */}
          <section className="card p-6">
            <UploadCard />
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}