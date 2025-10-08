import UploadCard from "@/components/UploadCard";
import RecentList from "@/components/RecentList";

export default function Home() {
  return (
    <main>
      <div className="container py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Upload Section */}
          <section className="md:col-span-2 card p-6">
            <UploadCard />
          </section>

          {/* Quick Search Section */}
          <section className="card p-6">
            <h2 className="text-lg font-semibold mb-3">Quick search</h2>
            <form className="space-y-3">
            <input className="input" placeholder="Search text…" />
            <div className="grid grid-cols-3 gap-3">
            <input className="input" type="number" placeholder="MM" aria-label="Month" />
            <input className="input" type="number" placeholder="DD" aria-label="Day" />
            <input className="input" type="number" placeholder="YYYY" aria-label="Year" />
          </div>
            <select className="input">
            <option>All types</option>
            <option>receipt</option>
            <option>invoice</option>
            </select>
            <button type="button" className="btn btn-primary w-full">Search</button>
            </form>
            </section>
        </div>

        {/* Recent Documents */}
        <section className="card p-6" id="docs">
          <RecentList />
        </section>
      </div>
    </main>
  );
}
