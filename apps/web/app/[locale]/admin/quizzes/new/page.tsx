'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Topic {
  id: string
  titleEn: string
  phase: {
    titleEn: string
    track: {
      titleEn: string
    }
  }
}

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

export default function NewQuizPage() {
  const router = useRouter()
  const [topics, setTopics] = useState<Topic[]>([])
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    topicId: '',
    titleEn: '',
    titleTr: '',
    descriptionEn: '',
    descriptionTr: '',
    passingScore: 70,
    timeLimit: 0
  })
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    fetchTopics()
  }, [])

  const fetchTopics = async () => {
    try {
      const res = await fetch('/api/admin/topics')
      const data = await res.json()
      if (data.success) {
        setTopics(data.data)
      }
    } catch (error) {
      console.error('Error fetching topics:', error)
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
    
    // If marking as correct, unmark others
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
      const res = await fetch('/api/admin/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          questions
        })
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Quiz created successfully')
        router.push('/admin/quizzes')
      } else {
        toast.error(data.error || 'Failed to create quiz')
      }
    } catch (error) {
      console.error('Error creating quiz:', error)
      toast.error('Failed to create quiz')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Create New Quiz</h1>
        <p className="text-muted-foreground">Add a quiz with questions and answers</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Topic *</label>
              <select
                value={formData.topicId}
                onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select a topic</option>
                {topics.map(topic => (
                  <option key={topic.id} value={topic.id}>
                    {topic.phase.track.titleEn} → {topic.phase.titleEn} → {topic.titleEn}
                  </option>
                ))}
              </select>
            </div>

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
                <label className="block text-sm font-medium mb-2">Time Limit (minutes, 0 = no limit)</label>
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
                            placeholder={`Choice \${cIndex + 1} (EN)`}
                            required
                          />
                          <input
                            type="text"
                            value={choice.choiceTextTr}
                            onChange={(e) => updateChoice(qIndex, cIndex, 'choiceTextTr', e.target.value)}
                            className="w-full p-1 border rounded text-sm"
                            placeholder={`Seçenek \${cIndex + 1} (TR)`}
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
                    placeholder="Optional explanation for the answer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Explanation (TR)</label>
                  <textarea
                    value={question.explanationTr}
                    onChange={(e) => updateQuestion(qIndex, 'explanationTr', e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                    rows={2}
                    placeholder="Cevap için açıklama (opsiyonel)"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {questions.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No questions added yet</p>
              <Button type="button" onClick={addQuestion}>
                Add First Question
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={saving || questions.length === 0}>
            {saving ? 'Creating...' : 'Create Quiz'}
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
