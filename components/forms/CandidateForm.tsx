'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';

interface CandidateFormProps {
  onBack: () => void;
}

export default function CandidateForm({ onBack }: CandidateFormProps) {
  const { register } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: '',
    phone: '',
    location: '',
    country: '',
    timezone: '',
    primaryFunction: '',
    yearsExperience: '',
    currentRole: '',
    education: '',
    englishProficiency: '',
    availability: '',
    linkedIn: '',
    portfolio: '',
    whyInstinctX: '',
    startupExperience: '',
    resume: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, resume: e.target.files![0] }));
    }
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
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        userType: 'candidate',
        fullName: formData.fullName,
        location: formData.location,
        country: formData.country,
        timezone: formData.timezone,
        primaryFunction: formData.primaryFunction,
        yearsExperience: formData.yearsExperience,
        currentRole: formData.currentRole,
        education: formData.education,
        englishProficiency: formData.englishProficiency,
        availability: formData.availability,
        linkedIn: formData.linkedIn,
        portfolio: formData.portfolio,
        whyInstinctX: formData.whyInstinctX,
        startupExperience: formData.startupExperience,
        phone: formData.phone,
        // resumePath would be set after file upload
      });
      
      // Show success toast and go to home
      showToast('Application submitted successfully! Your account has been created for office use.', 'success');
      setLoading(false);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setLoading(false);
    }
  };

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
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-black mb-2">Accelerator Application</h1>
              <p className="text-gray-600 font-light">Apply for elite operator training</p>
            </div>
          </div>
          <div className="bg-gray-50 p-6 border-l-4 border-black">
            <p className="text-sm font-light text-gray-700 mb-3">
              The InstinctX Accelerator is an 8-week intensive program that transforms elite talent into startup-ready operators. Upon completion and passing, you&apos;re guaranteed placement with our client startups.
            </p>
            <p className="text-sm font-light text-gray-700">
              <strong className="font-semibold">Acceptance Rate:</strong> Only 50 candidates per month. Only 15 graduate with placement.
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
          {/* Personal Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black border-b border-gray-200 pb-3">Personal Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="text-sm font-medium text-black mb-2 block">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                />
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-medium text-black mb-2 block">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                />
              </div>
              <div>
                <label htmlFor="phone" className="text-sm font-medium text-black mb-2 block">
                  Phone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  placeholder="+94 77 123 4567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                />
              </div>
              <div>
                <label htmlFor="location" className="text-sm font-medium text-black mb-2 block">
                  City/Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  placeholder="e.g. Colombo"
                  value={formData.location}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                />
              </div>
              <div>
                <label htmlFor="country" className="text-sm font-medium text-black mb-2 block">
                  Country *
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  required
                  placeholder="e.g. Sri Lanka"
                  value={formData.country}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                />
              </div>
              <div>
                <label htmlFor="timezone" className="text-sm font-medium text-black mb-2 block">
                  Timezone
                </label>
                <input
                  type="text"
                  id="timezone"
                  name="timezone"
                  placeholder="e.g. GMT+5:30"
                  value={formData.timezone}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                />
              </div>
            </div>
          </div>

          {/* Professional Background */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black border-b border-gray-200 pb-3">Professional Background</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="primaryFunction" className="text-sm font-medium text-black mb-2 block">
                  Primary Function *
                </label>
                <select
                  id="primaryFunction"
                  name="primaryFunction"
                  required
                  value={formData.primaryFunction}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  <option value="">Select function</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Growth">Growth</option>
                  <option value="Leadership">Leadership</option>
                  <option value="Strategic VA">Strategic VA</option>
                </select>
              </div>
              <div>
                <label htmlFor="yearsExperience" className="text-sm font-medium text-black mb-2 block">
                  Years of Experience *
                </label>
                <select
                  id="yearsExperience"
                  name="yearsExperience"
                  required
                  value={formData.yearsExperience}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  <option value="">Select years</option>
                  <option value="0-2">0-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-8">5-8 years</option>
                  <option value="8-10">8-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
              <div>
                <label htmlFor="currentRole" className="text-sm font-medium text-black mb-2 block">
                  Current/Most Recent Role
                </label>
                <input
                  type="text"
                  id="currentRole"
                  name="currentRole"
                  placeholder="e.g. Senior Software Engineer"
                  value={formData.currentRole}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                />
              </div>
              <div>
                <label htmlFor="education" className="text-sm font-medium text-black mb-2 block">
                  Highest Education
                </label>
                <input
                  type="text"
                  id="education"
                  name="education"
                  placeholder="e.g. Bachelor's in Computer Science"
                  value={formData.education}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                />
              </div>
              <div>
                <label htmlFor="englishProficiency" className="text-sm font-medium text-black mb-2 block">
                  English Proficiency *
                </label>
                <select
                  id="englishProficiency"
                  name="englishProficiency"
                  required
                  value={formData.englishProficiency}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  <option value="">Select level</option>
                  <option value="native">Native/Bilingual</option>
                  <option value="fluent">Fluent</option>
                  <option value="advanced">Advanced</option>
                  <option value="intermediate">Intermediate</option>
                </select>
              </div>
              <div>
                <label htmlFor="availability" className="text-sm font-medium text-black mb-2 block">
                  Availability *
                </label>
                <select
                  id="availability"
                  name="availability"
                  required
                  value={formData.availability}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  <option value="">When can you start?</option>
                  <option value="immediately">Immediately</option>
                  <option value="2weeks">2 weeks notice</option>
                  <option value="1month">1 month notice</option>
                  <option value="2months">2+ months</option>
                </select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="linkedIn" className="text-sm font-medium text-black mb-2 block">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  id="linkedIn"
                  name="linkedIn"
                  placeholder="linkedin.com/in/yourprofile"
                  value={formData.linkedIn}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                />
              </div>
              <div>
                <label htmlFor="portfolio" className="text-sm font-medium text-black mb-2 block">
                  Portfolio/Website
                </label>
                <input
                  type="url"
                  id="portfolio"
                  name="portfolio"
                  placeholder="yourportfolio.com"
                  value={formData.portfolio}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                />
              </div>
            </div>
          </div>

          {/* About You */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black border-b border-gray-200 pb-3">About You</h2>
            <div>
              <label htmlFor="whyInstinctX" className="text-sm font-medium text-black mb-2 block">
                Why do you want to join the InstinctX Accelerator? *
              </label>
              <textarea
                id="whyInstinctX"
                name="whyInstinctX"
                required
                placeholder="Tell us what excites you about this opportunity and what you hope to gain from the program..."
                rows={4}
                value={formData.whyInstinctX}
                onChange={handleChange}
                className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              />
            </div>
            <div>
              <label htmlFor="startupExperience" className="text-sm font-medium text-black mb-2 block">
                Startup Experience
              </label>
              <textarea
                id="startupExperience"
                name="startupExperience"
                placeholder="Describe any experience working in startups or high-growth environments..."
                rows={4}
                value={formData.startupExperience}
                onChange={handleChange}
                className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              />
            </div>
          </div>

          {/* Resume */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black border-b border-gray-200 pb-3">Resume</h2>
            <div>
              <label htmlFor="resume" className="text-sm font-medium text-black mb-2 block">
                Upload Resume *
              </label>
              <div className="mt-2">
                <label
                  htmlFor="resume"
                  className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded appearance-none cursor-pointer hover:border-black focus:outline-none"
                >
                  <span className="flex items-center space-x-2">
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
                      className="w-6 h-6 text-gray-600"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" x2="12" y1="3" y2="15"></line>
                    </svg>
                    <span className="font-medium text-gray-600">
                      {formData.resume ? formData.resume.name : 'Click to upload resume'}
                    </span>
                  </span>
                  <input
                    type="file"
                    id="resume"
                    name="resume"
                    required
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">PDF, DOC, or DOCX (Max 5MB)</p>
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
              Applications reviewed within 5-7 business days. Selected candidates will receive platform access for assessments.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

