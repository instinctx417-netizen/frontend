export default function ExclusivitySection() {
  return (
    <section className="py-24 px-6 lg:px-12 bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, transparent 30%, white 50%, transparent 70%)', backgroundSize: '200% 100%' }}></div>
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="w-24 h-1 bg-white mx-auto mb-8"></div>
        <h2 className="text-3xl lg:text-4xl font-bold mb-6">
          Only 15 operators. Only 15 startups. Per month.
        </h2>
        <p className="text-lg font-light text-gray-300 leading-relaxed">
          From <span className="text-white font-medium">hundreds</span> of applicants, we select{' '}
          <span className="text-white font-medium">50</span>. From those 50, only{' '}
          <span className="text-white font-medium">15</span> pass our rigorous Accelerator. That&apos;s your competitive advantage — operators trained by Stanford professors and VC-backed founders, ready to integrate seamlessly into your team.
        </p>
      </div>
    </section>
  );
}

