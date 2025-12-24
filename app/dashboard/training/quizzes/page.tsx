'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { clientPortalApi } from '@/lib/clientPortalApi';
import { useToast } from '@/contexts/ToastContext';

interface Quiz {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer?: string; // Not included for staff users
  version: number;
}

interface QuizAnswer {
  quiz_id: number;
  selected_answer: string;
  is_correct: boolean;
  quiz_version: number;
  current_version: number;
  correct_answer?: string; // Included in answer object after submission
}

export default function StaffQuizzesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [answers, setAnswers] = useState<Record<number, QuizAnswer>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState<Record<number, boolean>>({});
  const [stats, setStats] = useState<{ total_answered: number; correct_answers: number; outdated_answers: number } | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user?.userType !== 'candidate') {
      router.push('/dashboard');
      return;
    }

    if (isAuthenticated && user?.userType === 'candidate') {
      loadQuizzes();
      loadStats();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await clientPortalApi.getQuizzes();
      if (response.success && response.data) {
        setQuizzes(response.data.quizzes || []);
        
        // Map answers by quiz_id
        const answersMap: Record<number, QuizAnswer> = {};
        (response.data.answers || []).forEach((answer: any) => {
          answersMap[answer.quiz_id] = answer;
          setSelectedAnswers(prev => ({ ...prev, [answer.quiz_id]: answer.selected_answer }));
        });
        setAnswers(answersMap);
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

  const loadStats = async () => {
    try {
      const response = await clientPortalApi.getQuizStats();
      if (response.success && response.data) {
        setStats(response.data.stats);
      }
    } catch (error: any) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSubmitAnswer = async (quizId: number) => {
    const selectedAnswer = selectedAnswers[quizId];
    if (!selectedAnswer) {
      showToast('Please select an answer', 'error');
      return;
    }

    setSubmitting(prev => ({ ...prev, [quizId]: true }));
    try {
      const response = await clientPortalApi.submitQuizAnswer(quizId, selectedAnswer);
      if (response.success && response.data) {
        showToast(
          response.data.isCorrect ? 'Correct answer! ✅' : 'Incorrect answer. Try again! ❌',
          response.data.isCorrect ? 'success' : 'error'
        );
        loadQuizzes();
        loadStats();
      } else {
        showToast(response.message || 'Failed to submit answer', 'error');
      }
    } catch (error: any) {
      console.error('Error submitting answer:', error);
      showToast(error.message || 'Failed to submit answer', 'error');
    } finally {
      setSubmitting(prev => ({ ...prev, [quizId]: false }));
    }
  };

  if (loading || authLoading) {
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
          <h1 className="text-3xl font-bold text-black">Quizzes</h1>
          {stats && (
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Score: {stats.correct_answers} / {stats.total_answered}
              </p>
              {stats.outdated_answers > 0 && (
                <p className="text-xs text-yellow-600 mt-1">
                  {stats.outdated_answers} answer(s) may be outdated
                </p>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {quizzes.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 mb-2">No quizzes available yet.</p>
            <p className="text-sm text-gray-500">Quizzes are being set up by your administrator.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {quizzes.map((quiz) => {
              const answer = answers[quiz.id];
              const isOutdated = answer && answer.quiz_version < quiz.version;
              const hasAnswered = !!answer;

              return (
                <div key={quiz.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-black mb-4">{quiz.question}</h3>
                    {isOutdated && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800">
                          ⚠️ This quiz has been updated. Your previous answer was for version {answer.quiz_version}, current version is {quiz.version}.
                        </p>
                      </div>
                    )}
                    {hasAnswered && !isOutdated && (
                      <div className={`mb-4 p-3 rounded-md ${answer.is_correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        <p className={`text-sm font-medium ${answer.is_correct ? 'text-green-800' : 'text-red-800'}`}>
                          {answer.is_correct ? '✅ Correct!' : answer.correct_answer ? `❌ Incorrect. The correct answer is ${answer.correct_answer}` : '❌ Incorrect'}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {(['A', 'B', 'C', 'D'] as const).map((option) => {
                      const optionKey = `option_${option.toLowerCase()}` as keyof Quiz;
                      const optionText = quiz[optionKey] as string;
                      const isSelected = selectedAnswers[quiz.id] === option;
                      const isCorrect = hasAnswered && !isOutdated && answer.correct_answer === option;
                      const showResult = hasAnswered && !isOutdated;

                      return (
                        <label
                          key={option}
                          className={`block p-4 border-2 rounded-md cursor-pointer transition-colors ${
                            showResult && isCorrect
                              ? 'bg-green-50 border-green-500'
                              : showResult && isSelected && !isCorrect
                              ? 'bg-red-50 border-red-500'
                              : isSelected
                              ? 'bg-gray-100 border-black'
                              : 'bg-white border-gray-300 hover:border-gray-400'
                          } ${(hasAnswered || isOutdated) ? 'cursor-not-allowed opacity-75' : ''}`}
                        >
                          <input
                            type="radio"
                            name={`quiz-${quiz.id}`}
                            value={option}
                            checked={isSelected}
                            onChange={(e) => {
                              if (!hasAnswered && !isOutdated) {
                                setSelectedAnswers(prev => ({ ...prev, [quiz.id]: e.target.value }));
                              }
                            }}
                            disabled={hasAnswered || isOutdated}
                            className="mr-3"
                          />
                          <span className="font-medium text-black">{option}:</span> {optionText}
                        </label>
                      );
                    })}
                  </div>
                  <div className="mt-4">
                    {!hasAnswered && (
                      <button
                        onClick={() => handleSubmitAnswer(quiz.id)}
                        disabled={!selectedAnswers[quiz.id] || submitting[quiz.id]}
                        className="px-4 py-2 dashboard-btn-primary font-medium rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting[quiz.id] ? 'Submitting...' : 'Submit Answer'}
                      </button>
                    )}
                    {hasAnswered && isOutdated && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800">
                          ⚠️ This quiz has been updated. You cannot answer the new version. Please contact admin if you need to retake this quiz.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

