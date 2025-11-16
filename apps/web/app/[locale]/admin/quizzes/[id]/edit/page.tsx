'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Question {
  questionTextEn: string
  questionTextTr: string
  explanationEn: string
  explanationTr: string
  choices: Choice[]
}

interface Choice {
  choiceTextEn: string
  choiceTextTr: string
  isCorrect: boolean
}

export default function EditQuizPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    titleEn: '',
    titleTr: '',
    descriptionEn: '',
    descriptionTr: '',
    passingScore: 70,
    timeLimit: 0
  })
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    fetchQuiz()
  }, [])

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`/api/admin/quizzes/\${quizId}`)
      const data = await res.json()
      if (data.success) {
        const quiz = data.data
        setFormData({
          titleEn: quiz.titleEn,
          titleTr: quiz.titleTr,
          descriptionEn: quiz.descriptionEn || '',
          descriptionTr: quiz.descriptionTr || '',
          passingScore: quiz.passingScore,
          timeLimit: quiz.timeLimit || 0
        })
        
        // Map existing questions
        const mappedQuestions = quiz.questions.map((q: any) => ({
          questionTextEn: q.questionTextEn,
          questionTextTr: q.questionTextTr,
          explanationEn: q.explanationEn || '',
          explanationTr: q.explanationTr || '',
          choices: q.choices.map((c: any) => ({
            choiceTextEn: c.choiceTextEn,
            choiceTextTr: c.choiceTextTr,
            isCorrect: c.isCorrect
          }))
        }))
        setQuestions(mappedQuestions)
      } else {
        toast.error('Quiz not found')
        router.push('/admin/quizzes')
      }
    } catch (error) {
      console.error('Error fetching quiz:', error)
      toast.error('Failed to load quiz')
    } finally {
      setLoading(false)
    }
  }

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionTextEn: '',
        questionTextTr: '',
        explanationEn: '',
        explanationTr: '',
        choices: [
          { choiceTextEn: '', choiceTextTr: '', isCorrect: true },
          { choiceTextEn: '', choiceTextTr: '', isCorrect: false },
          { choiceTextEn: '', choiceTextTr: '', isCorrect: false },
          { choiceTextEn: '', choiceTextTr: '', isCorrect: false }
        ]
      }
    ])
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  const updateChoice = (qIndex: number, cIndex: number, field: string, value: any) => {
    const updated = [...questions]
    const choices = [...updated[qIndex].choices]
    choices[cIndex] = { ...choices[cIndex], [field]: value }
    
    if (field === 'isCorrect' && value === true) {
      choices.forEach((c, i) => {
        if (i !== cIndex) c.isCorrect = false
      })
    }
    
    updated[qIndex].choices = choices
    setQuestions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (questions.length === 0) {
      toast.error('Add at least one question')
      return
    }

    setSaving(true)

    try {
      // Update quiz basic info
      const quizRes = await fetch(`/api/admin/quizzes/\${quizId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const quizData = await quizRes.json()

      if (quizData.success) {
        // Note: For full question update, you'd need a separate endpoint
        // For now, we just update the quiz metadata
        toast.success('Quiz updated successfully')
        toast.info('Note: Question editing requires backend support')
        router.push('/admin/quizzes')
      } else {
        toast.error(quizData.error || 'Failed to update quiz')
      }
    } catch (error) {
      console.error('Error updating quiz:', error)
      toast.error('Failed to update quiz')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-20">Loading quiz...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Edit Quiz</h1>
        <p className="text-muted-foreground">Update quiz information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title (EN) *</label>
                <input
                  type="text"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Title (TR) *</label>
                <input
                  type="text"
                  value={formData.titleTr}
                  onChange={(e) => setFormData({ ...formData, titleTr: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Passing Score (%)</label>
                <input
                  type="number"
                  value={formData.passingScore}
                  onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Time Limit (minutes)</label>
                <input
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded"
                  min="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Questions ({questions.length})</h2>
          <Button type="button" onClick={addQuestion} variant="outline">
            + Add Question
          </Button>
        </div>

        {questions.map((question, qIndex) => (
          <Card key={qIndex} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Question {qIndex + 1}</CardTitle>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeQuestion(qIndex)}
                >
                  Remove
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Question Text (EN)</label>
                  <textarea
                    value={question.questionTextEn}
                    onChange={(e) => updateQuestion(qIndex, 'questionTextEn', e.target.value)}
                    className="w-full p-2 border rounded"
                    rows={2}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Question Text (TR)</label>
                  <textarea
                    value={question.questionTextTr}
                    onChange={(e) => updateQuestion(qIndex, 'questionTextTr', e.target.value)}
                    className="w-full p-2 border rounded"
                    rows={2}
                    required
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium mb-3">Choices (Select the correct answer)</label>
                <div className="space-y-3">
                  {question.choices.map((choice, cIndex) => (
                    <div key={cIndex} className={`p-3 border rounded \${choice.isCorrect ? 'bg-green-50 border-green-500' : ''}`}>
                      <div className="flex items-start gap-2 mb-2">
                        <input
                          type="radio"
                          name={`correct-\${qIndex}`}
                          checked={choice.isCorrect}
                          onChange={() => updateChoice(qIndex, cIndex, 'isCorrect', true)}
                          className="mt-1"
                        />
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={choice.choiceTextEn}
                            onChange={(e) => updateChoice(qIndex, cIndex, 'choiceTextEn', e.target.value)}
                            className="w-full p-1 border rounded text-sm"
                            required
                          />
                          <input
                            type="text"
                            value={choice.choiceTextTr}
                            onChange={(e) => updateChoice(qIndex, cIndex, 'choiceTextTr', e.target.value)}
                            className="w-full p-1 border rounded text-sm"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Explanation (EN)</label>
                  <textarea
                    value={question.explanationEn}
                    onChange={(e) => updateQuestion(qIndex, 'explanationEn', e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Explanation (TR)</label>
                  <textarea
                    value={question.explanationTr}
                    onChange={(e) => updateQuestion(qIndex, 'explanationTr', e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/quizzes')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
