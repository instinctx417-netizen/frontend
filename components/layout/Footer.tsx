import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">IX</span>
            </div>
            <span className="text-lg font-semibold text-black tracking-tight">InstinctX</span>
          </div>
          <div className="text-sm text-gray-500">© 2025 InstinctX. Offshoring, redefined.</div>
        </div>
      </div>
    </footer>
  );
}

