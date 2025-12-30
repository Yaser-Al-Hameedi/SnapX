import UploadCard from "@/components/UploadCard";
import RecentList from "@/components/RecentList";
import SearchCard from "@/components/SearchCard";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute>
      <main>
        <div className="container py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Upload Section */}
          <section className="md:col-span-2 card p-6">
            <UploadCard />
          </section>

          {/* Quick Search Section */}
          <section className="card p-6">
            <SearchCard />
          </section>
        </div>

        {/* Recent Documents */}
        <section className="card p-6" id="docs">
          <RecentList />
        </section>
      </div>
    </main>
    </ProtectedRoute>
  );
}