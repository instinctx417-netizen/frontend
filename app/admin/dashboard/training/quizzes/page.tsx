'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/clientPortalApi';
import { useToast } from '@/contexts/ToastContext';

interface Quiz {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  version: number;
  created_at: string;
}

export default function AdminQuizzesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user?.userType !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (isAuthenticated && user?.userType === 'admin') {
      loadQuizzes();
    }
  }, [isAuthenticated, authLoading, user]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminApi.getQuizzes();
      if (response.success && response.data) {
        setQuizzes(response.data.quizzes || []);
      } else {
        setError(response.message || 'Failed to load quizzes');
      }
    } catch (error: any) {
      console.error('Error loading quizzes:', error);
      setError(error.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingQuiz) {
        const response = await adminApi.updateQuiz(editingQuiz.id, formData);
        if (response.success) {
          showToast('Quiz updated successfully (version incremented)', 'success');
          setShowModal(false);
          setEditingQuiz(null);
          loadQuizzes();
        } else {
          setError(response.message || 'Failed to update quiz');
        }
      } else {
        const response = await adminApi.createQuiz(formData);
        if (response.success) {
          showToast('Quiz created successfully', 'success');
          setShowModal(false);
          resetForm();
          loadQuizzes();
        } else {
          setError(response.message || 'Failed to create quiz');
        }
      }
    } catch (error: any) {
      console.error('Error saving quiz:', error);
      setError(error.message || 'Failed to save quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this quiz? This will also delete all answers.')) return;

    try {
      const response = await adminApi.deleteQuiz(id);
      if (response.success) {
        showToast('Quiz deleted successfully', 'success');
        loadQuizzes();
      } else {
        showToast(response.message || 'Failed to delete quiz', 'error');
      }
    } catch (error: any) {
      console.error('Error deleting quiz:', error);
      showToast(error.message || 'Failed to delete quiz', 'error');
    }
  };

  const handleEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      question: quiz.question,
      optionA: quiz.option_a,
      optionB: quiz.option_b,
      optionC: quiz.option_c,
      optionD: quiz.option_d,
      correctAnswer: quiz.correct_answer,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
    });
    setEditingQuiz(null);
  };

  if (loading && quizzes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">Quizzes</h1>
            <p className="text-sm text-gray-600 mt-2">
              Note: Updating a quiz will increment its version. Staff answers are tied to specific versions.
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 dashboard-btn-primary font-medium rounded-md cursor-pointer"
          >
            + Add Quiz
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {quizzes.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 mb-4">No quizzes added yet.</p>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-4 py-2 dashboard-btn-primary font-medium rounded-md cursor-pointer"
            >
              Add Your First Quiz
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-black mb-2">{quiz.question}</h3>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className={`p-3 rounded ${quiz.correct_answer === 'A' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                        <span className="text-sm font-medium text-gray-600">A:</span>
                        <p className="text-sm text-black mt-1">{quiz.option_a}</p>
                      </div>
                      <div className={`p-3 rounded ${quiz.correct_answer === 'B' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                        <span className="text-sm font-medium text-gray-600">B:</span>
                        <p className="text-sm text-black mt-1">{quiz.option_b}</p>
                      </div>
                      <div className={`p-3 rounded ${quiz.correct_answer === 'C' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                        <span className="text-sm font-medium text-gray-600">C:</span>
                        <p className="text-sm text-black mt-1">{quiz.option_c}</p>
                      </div>
                      <div className={`p-3 rounded ${quiz.correct_answer === 'D' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                        <span className="text-sm font-medium text-gray-600">D:</span>
                        <p className="text-sm text-black mt-1">{quiz.option_d}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">Version: {quiz.version}</p>
                  </div>
                  <div className="ml-4 flex space-x-2">
                    <button
                      onClick={() => handleEdit(quiz)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(quiz.id)}
                      className="px-3 py-1 text-sm border border-red-300 rounded-md text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-black mb-4">
                {editingQuiz ? 'Edit Quiz' : 'Add Quiz'}
              </h2>
              {editingQuiz && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Updating this quiz will increment its version. Existing staff answers will remain tied to the previous version.
                  </p>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question *
                  </label>
                  <textarea
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Option A *
                    </label>
                    <input
                      type="text"
                      value={formData.optionA}
                      onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Option B *
                    </label>
                    <input
                      type="text"
                      value={formData.optionB}
                      onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Option C *
                    </label>
                    <input
                      type="text"
                      value={formData.optionC}
                      onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Option D *
                    </label>
                    <input
                      type="text"
                      value={formData.optionD}
                      onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Answer *
                  </label>
                  <select
                    value={formData.correctAnswer}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 dashboard-btn-primary font-medium rounded-md cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : editingQuiz ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

