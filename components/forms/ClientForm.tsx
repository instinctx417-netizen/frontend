'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface ClientFormProps {
  onBack: () => void;
}

export default function ClientForm({ onBack }: ClientFormProps) {
  const { register } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    industry: '',
    companySize: '',
    contactName: '',
    companyEmail: '',
    phone: '',
    hireType: '',
    engagementType: '',
    timeline: '',
    jobFunctions: [] as string[],
    specificNeeds: '',
    heardFrom: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      jobFunctions: prev.jobFunctions.includes(value)
        ? prev.jobFunctions.filter(f => f !== value)
        : [...prev.jobFunctions, value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await register({
        email: formData.companyEmail,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        userType: 'client',
        companyName: formData.companyName,
        industry: formData.industry,
        companySize: formData.companySize,
        contactName: formData.contactName,
        phone: formData.phone,
        hireType: formData.hireType,
        engagementType: formData.engagementType,
        timeline: formData.timeline,
        jobFunctions: formData.jobFunctions,
        specificNeeds: formData.specificNeeds,
        heardFrom: formData.heardFrom,
      });
      
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setLoading(false);
    }
  };

  const jobFunctionOptions = ['Finance', 'Operations', 'Engineering', 'Growth', 'Leadership', 'Strategic VA'];

  return (
    <div className="min-h-screen bg-white py-16 lg:py-24 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-black mt-8 mb-12 font-light transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 mr-2"
          >
            <path d="m12 19-7-7 7-7"></path>
            <path d="M19 12H5"></path>
          </svg>
          Back to selection
        </button>

        <div className="mb-12">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 text-white"
              >
                <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
                <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
                <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
                <path d="M10 6h4"></path>
                <path d="M10 10h4"></path>
                <path d="M10 14h4"></path>
                <path d="M10 18h4"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-black mb-2">Client Application</h1>
              <p className="text-gray-600 font-light">Join the InstinctX ecosystem</p>
            </div>
          </div>
          <div className="bg-gray-50 p-6 border-l-4 border-black">
            <p className="text-sm font-light text-gray-700">
              Complete this application to access the InstinctX platform where you&apos;ll manage your operators, view updates, handle billing, and communicate with our team.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Account Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black border-b border-gray-200 pb-3">Account Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="text-sm font-medium text-black mb-2 block">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="text-sm font-medium text-black mb-2 block">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                />
              </div>
              <div>
                <label htmlFor="password" className="text-sm font-medium text-black mb-2 block">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                />
                <p className="text-xs text-gray-500 mt-1">At least 8 characters with uppercase, lowercase, and number</p>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="text-sm font-medium text-black mb-2 block">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                />
              </div>
            </div>
          </div>
          {/* Company Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black border-b border-gray-200 pb-3">Company Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="companyName" className="text-sm font-medium text-black mb-2 block">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                />
              </div>
              <div>
                <label htmlFor="industry" className="text-sm font-medium text-black mb-2 block">
                  Industry
                </label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  placeholder="e.g. SaaS, Fintech, E-commerce"
                  value={formData.industry}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                />
              </div>
              <div>
                <label htmlFor="companySize" className="text-sm font-medium text-black mb-2 block">
                  Company Size *
                </label>
                <select
                  id="companySize"
                  name="companySize"
                  required
                  value={formData.companySize}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black border-b border-gray-200 pb-3">Contact Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contactName" className="text-sm font-medium text-black mb-2 block">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="contactName"
                  name="contactName"
                  required
                  value={formData.contactName}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                />
              </div>
              <div>
                <label htmlFor="companyEmail" className="text-sm font-medium text-black mb-2 block">
                  Email *
                </label>
                <input
                  type="email"
                  id="companyEmail"
                  name="companyEmail"
                  required
                  value={formData.companyEmail}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                />
              </div>
              <div>
                <label htmlFor="phone" className="text-sm font-medium text-black mb-2 block">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                />
              </div>
            </div>
          </div>

          {/* Hiring Needs */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black border-b border-gray-200 pb-3">Hiring Needs</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="hireType" className="text-sm font-medium text-black mb-2 block">
                  What do you need? *
                </label>
                <select
                  id="hireType"
                  name="hireType"
                  required
                  value={formData.hireType}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  <option value="">Select type</option>
                  <option value="operator">One Operator</option>
                  <option value="pod">Build a Pod</option>
                </select>
              </div>
              <div>
                <label htmlFor="engagementType" className="text-sm font-medium text-black mb-2 block">
                  Engagement Type *
                </label>
                <select
                  id="engagementType"
                  name="engagementType"
                  required
                  value={formData.engagementType}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  <option value="">Select engagement</option>
                  <option value="full-time">Full-Time</option>
                  <option value="part-time">Part-Time</option>
                  <option value="project-based">Project-Based</option>
                </select>
              </div>
              <div>
                <label htmlFor="timeline" className="text-sm font-medium text-black mb-2 block">
                  When do you need them?
                </label>
                <select
                  id="timeline"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  <option value="">Select timeline</option>
                  <option value="immediately">Immediately</option>
                  <option value="1-2weeks">1-2 weeks</option>
                  <option value="3-4weeks">3-4 weeks</option>
                  <option value="1-2months">1-2 months</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-black mb-3 block">Job Functions *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {jobFunctionOptions.map((func) => (
                  <label
                    key={func}
                    className={`flex items-center space-x-2 rounded border-2 p-3 cursor-pointer transition-all bg-white ${
                      formData.jobFunctions.includes(func)
                        ? 'border-black bg-gray-50'
                        : 'border-gray-300 hover:border-black'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.jobFunctions.includes(func)}
                      onChange={() => handleCheckboxChange(func)}
                      className="h-4 w-4 rounded border-gray-300 text-black focus:ring-2 focus:ring-black"
                    />
                    <span className="font-medium text-sm">{func}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="specificNeeds" className="text-sm font-medium text-black mb-2 block">
                Specific Needs or Requirements
              </label>
              <textarea
                id="specificNeeds"
                name="specificNeeds"
                placeholder="Tell us about your specific requirements, challenges, or what success looks like..."
                rows={4}
                value={formData.specificNeeds}
                onChange={handleChange}
                className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-6">
            <div>
              <label htmlFor="heardFrom" className="text-sm font-medium text-black mb-2 block">
                How did you hear about us?
              </label>
              <select
                id="heardFrom"
                name="heardFrom"
                value={formData.heardFrom}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              >
                <option value="">Select source</option>
                <option value="search">Search Engine</option>
                <option value="referral">Referral</option>
                <option value="social">Social Media</option>
                <option value="content">Content/Article</option>
                <option value="event">Event/Conference</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-10 w-full md:w-auto px-8 py-4 bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 ml-2"
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </button>
            <p className="text-sm text-gray-500 font-light mt-4">
              By submitting, you&apos;ll get platform access and be considered for the next available cohort.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

