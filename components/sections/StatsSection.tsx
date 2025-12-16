export default function StatsSection() {
  const stats = [
    { value: '$550K', label: 'Annual cost savings for Nasdaq-listed tech firm' },
    { value: '3-5x', label: 'Average ROI within first 90 days' },
    { value: 'Top 1%', label: 'Only the elite make it through our vetting' },
  ];

  return (
    <section className="py-32 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-16 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-6xl font-bold text-black mb-4">
                {stat.value}
              </div>
              <p className="text-gray-600 font-light">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

