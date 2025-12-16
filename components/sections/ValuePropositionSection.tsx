export default function ValuePropositionSection() {
  const propositions = [
    {
      title: 'Specialized roles you thought impossible to fill this fast',
      description: 'Finance. Engineering. Growth. Operations. Leadership. Not just any talent — strategic operators matched to your exact needs.',
    },
    {
      title: 'Proprietary Accelerator built with Stanford & VC experts',
      description: 'Not just placement. A transformation program that elevates operators to Silicon Valley standards.',
    },
    {
      title: 'Seamless integration from day one',
      description: 'They don\'t feel remote. They feel like your team. Because they are.',
    },
  ];

  return (
    <section className="py-32 px-6 lg:px-12 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-16">
          {propositions.map((item, index) => (
            <div key={index} className="space-y-4">
              <div className="h-1 bg-black" style={{ width: '48px' }}></div>
              <h3 className="text-2xl font-semibold text-black">{item.title}</h3>
              <p className="text-gray-600 font-light leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

