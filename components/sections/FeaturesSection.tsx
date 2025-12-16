export default function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-black">
          <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path>
          <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path>
          <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path>
        </svg>
      ),
      title: 'AI-Powered Matching',
      description: 'Our intelligence analyzes your needs, culture, and goals — then matches you with the perfect operator. 99% accuracy rate.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-black">
          <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
        </svg>
      ),
      title: 'Zero Interview Rounds',
      description: 'No resume screening. No first calls. No technical rounds. Just matched with pre-vetted, Accelerator-trained operators ready to perform.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-black">
          <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path>
          <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path>
          <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path>
        </svg>
      ),
      title: 'Gets Smarter Every Time',
      description: 'Every match teaches our AI more. Every success refines the algorithm. The more we work, the better we get.',
    },
  ];

  return (
    <section className="py-32 px-6 lg:px-12 bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="relative inline-block mb-8">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-black">
                <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path>
                <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path>
                <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path>
              </svg>
            </div>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">The old way is broken</h2>
          <p className="text-xl font-light text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Screening hundreds of resumes. Scheduling endless interviews. Hoping your gut feeling is right.
            <span className="block mt-4 text-white font-medium">There&apos;s a better way.</span>
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12 mb-20">
          {features.map((feature, index) => (
            <div key={index} className="text-center space-y-4 relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-300 font-light leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-gray-900 p-12 border-l-4 border-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none animate-shimmer"></div>
          <p className="text-2xl font-light leading-relaxed mb-6 relative z-10">
            &quot;Yes, our operators happen to be global. But that&apos;s not the story.&quot;
          </p>
          <p className="text-lg text-gray-400 font-light relative z-10">
            The story is how we&apos;ve completely reimagined hiring — making it{' '}
            <span className="text-white font-medium">faster, smarter, and more precise</span> than ever before.
          </p>
        </div>
      </div>
    </section>
  );
}

