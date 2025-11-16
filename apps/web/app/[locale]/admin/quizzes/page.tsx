'use client'

import { useEffect, useState } from 'react'
import { Link } from '@/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Quiz {
  id: string
  titleEn: string
  titleTr: string
  passingScore: number
  topic: {
    titleEn: string
  }
  _count: {
    questions: number
  }
}

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const res = await fetch('/api/admin/quizzes')
      const data = await res.json()
      if (data.success) {
        setQuizzes(data.data)
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error)
      toast.error('Failed to load quizzes')
    } finally {
      setLoading(false)
    }
  }

  const deleteQuiz = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz and all its questions?')) return

    try {
      const res = await fetch(\`/api/admin/quizzes/\${id}\`, {
        method: 'DELETE'
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Quiz deleted successfully')
        fetchQuizzes()
      } else {
        toast.error(data.error || 'Failed to delete quiz')
      }
    } catch (error) {
      console.error('Error deleting quiz:', error)
      toast.error('Failed to delete quiz')
    }
  }

  if (loading) {
    return <div className="text-center py-20">Loading quizzes...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quizzes Management</h1>
          <p className="text-muted-foreground">
            Manage quizzes, questions, and answers
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/quizzes/new">Create Quiz</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {quizzes.map((quiz) => (
          <Card key={quiz.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="mb-2">✅ {quiz.titleEn}</CardTitle>
                  <CardDescription>TR: {quiz.titleTr}</CardDescription>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="secondary">{quiz.topic.titleEn}</Badge>
                    <Badge variant="outline">{quiz._count.questions} questions</Badge>
                    <Badge variant="outline">Pass: {quiz.passingScore}%</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={\`/admin/quizzes/\${quiz.id}/edit\`}>Edit</Link>
                  </Button>
                  <Button
                    onClick={() => deleteQuiz(quiz.id)}
                    variant="destructive"
                    size="sm"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}

        {quizzes.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No quizzes found</p>
              <Button asChild>
                <Link href="/admin/quizzes/new">Create your first quiz</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
