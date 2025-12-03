'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useSession } from 'next-auth/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@/navigation'
import { toast } from 'sonner'

interface Choice {
  id: string
  choiceTextEn: string
  choiceTextTr: string
  isCorrect: boolean
  order: number
}

interface Question {
  id: string
  questionTextEn: string
  questionTextTr: string
  explanationEn?: string
  explanationTr?: string
  order: number
  choices: Choice[]
}

interface Quiz {
  id: string
  titleEn: string
  titleTr: string
  descriptionEn?: string
  descriptionTr?: string
  passingScore: number
  topic: {
    id: string
    slug: string
    titleEn: string
    titleTr: string
    phase: {
      slug: string
      titleEn: string
      titleTr: string
      track: {
        slug: string
        titleEn: string
        titleTr: string
      }
    }
  }
  questions: Question[]
}

interface QuizResult {
  attemptId: string
  score: number
  correctAnswers: number
  totalQuestions: number
  results: Array<{
    questionId: string
    questionText: string
    userChoiceId?: string
    userChoiceText?: string
    correctChoiceId?: string
    correctChoiceText?: string
    isCorrect: boolean
    explanation?: string
  }>
}

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations()
  const locale = useLocale()
  const { data: session } = useSession()

  const quizId = params.quizId as string

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<QuizResult | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!session?.user) {
      toast.error('Please log in to take quizzes')
      router.push('/login')
      return
    }

    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/quiz/${quizId}`)
        const data = await res.json()

        if (data.success) {
          setQuiz(data.data)
        } else {
          toast.error('Quiz not found')
        }
      } catch (error) {
        console.error('Error fetching quiz:', error)
        toast.error('Failed to load quiz')
      } finally {
        setLoading(false)
      }
    }

    fetchQuiz()
  }, [quizId, session, router])

  const handleAnswerSelect = (questionId: string, choiceId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: choiceId
    }))
  }

  const handleNext = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (!quiz) return

    // Check if all questions are answered
    const unansweredQuestions = quiz.questions.filter(q => !answers[q.id])
    if (unansweredQuestions.length > 0) {
      toast.error(`Please answer all questions (${unansweredQuestions.length} remaining)`)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/quiz/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, choiceId]) => ({
            questionId,
            choiceId
          }))
        })
      })

      const data = await res.json()

      if (data.success) {
        setResults(data.data)
        setShowResults(true)
        toast.success('Quiz submitted successfully!')
      } else {
        toast.error('Failed to submit quiz')
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
      toast.error('Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-pulse text-muted-foreground">
              Loading quiz...
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-4">Quiz not found</h1>
            <Button asChild>
              <Link href="/roadmap">Back to Roadmap</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const title = locale === 'tr' ? quiz.titleTr : quiz.titleEn
  const description = locale === 'tr' ? quiz.descriptionTr : quiz.descriptionEn

  if (showResults && results) {
    const passed = results.score >= quiz.passingScore
    const topicSlug = quiz.topic.slug
    const phaseSlug = quiz.topic.phase.slug
    const trackSlug = quiz.topic.phase.track.slug

    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Results Header */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
              passed ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              <span className="text-4xl">{passed ? '✅' : '❌'}</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">
              {passed ? 'Congratulations!' : 'Keep Trying!'}
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              You scored {results.score.toFixed(0)}% ({results.correctAnswers}/{results.totalQuestions} correct)
            </p>
            <Badge
              className={`text-base py-2 px-4 ${
                passed ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}
            >
              {passed ? 'Passed' : 'Failed'} (Required: {quiz.passingScore}%)
            </Badge>
          </div>

          {/* Question Results */}
          <div className="space-y-6 mb-8">
            {results.results.map((result, index) => (
              <Card key={result.questionId}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg flex-1">
                      Question {index + 1}
                    </CardTitle>
                    {result.isCorrect ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        Correct
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                        Incorrect
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{result.questionText}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {!result.isCorrect && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Your answer:
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {result.userChoiceText}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Correct answer:
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {result.correctChoiceText}
                      </p>
                    </div>
                    {result.explanation && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Explanation:</p>
                        <p className="text-sm text-muted-foreground">
                          {result.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button asChild variant="outline">
              <Link href={`/roadmap/${trackSlug}/${phaseSlug}/${topicSlug}`}>
                Back to Topic
              </Link>
            </Button>
            <Button onClick={() => window.location.reload()}>
              Retake Quiz
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const currentQ = quiz.questions[currentQuestion]
  const questionText = locale === 'tr' ? currentQ.questionTextTr : currentQ.questionTextEn
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100
  const answeredCount = Object.keys(answers).length

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{title}</h1>
          {description && (
            <p className="text-xl text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {answeredCount}/{quiz.questions.length} answered
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{questionText}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentQ.choices.map((choice) => {
                const choiceText = locale === 'tr' ? choice.choiceTextTr : choice.choiceTextEn
                const isSelected = answers[currentQ.id] === choice.id

                return (
                  <button
                    key={choice.id}
                    onClick={() => handleAnswerSelect(currentQ.id, choice.id)}
                    className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 ${
                        isSelected
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`}>
                        {isSelected && (
                          <div className="w-full h-full flex items-center justify-center text-primary-foreground text-xs">
                            ✓
                          </div>
                        )}
                      </div>
                      <span className="flex-1">{choiceText}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              variant="outline"
            >
              Previous
            </Button>
            <div className="flex gap-2">
              {currentQuestion < quiz.questions.length - 1 ? (
                <Button onClick={handleNext}>Next</Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || answeredCount < quiz.questions.length}
                >
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>

        {/* Question Navigator */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Question Navigator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-2">
              {quiz.questions.map((q, index) => {
                const isAnswered = !!answers[q.id]
                const isCurrent = index === currentQuestion

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(index)}
                    className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground'
                        : isAnswered
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {index + 1}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
