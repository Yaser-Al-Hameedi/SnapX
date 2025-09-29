export default function Header() {
  return (
    <header className="border-b bg-white/70 backdrop-blur">
      <div className="container h-14 flex items-center justify-between">
        <span className="text-lg font-semibold">SnapX</span>
        <nav className="text-sm space-x-6">
           <a href="/" className="text-slate-600 hover:text-slate-900">Dashboard</a>
           <a href="/documents" className="text-slate-600 hover:text-slate-900">Documents</a>
           <a href="#upload" className="text-slate-600 hover:text-slate-900">Upload</a>
        </nav>
      </div>
    </header>
  );
}
