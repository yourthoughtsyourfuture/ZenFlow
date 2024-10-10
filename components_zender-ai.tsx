'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { MeditationSession } from '@/components/meditation-session'
import { FeedbackForm } from '@/components/feedback-form'
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast'

interface Recommendation {
  id: string
  title: string
  description: string
  type: string
  duration: number
}

export function ZenderAI() {
  const { data: session, status } = useSession()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSession, setActiveSession] = useState<Recommendation | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [toast, setToast] = useState<{ title: string; description: string } | null>(null)

  useEffect(() => {
    async function fetchRecommendations() {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/recommendations')
          if (response.ok) {
            const data = await response.json()
            setRecommendations(data)
          } else {
            throw new Error('Failed to fetch recommendations')
          }
        } catch (error) {
          console.error('Error fetching recommendations:', error)
          setToast({
            title: 'Error',
            description: 'Failed to fetch recommendations. Please try again later.',
          })
        } finally {
          setLoading(false)
        }
      }
    }

    if (status === 'authenticated') {
      fetchRecommendations()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [session, status])

  const handleStartSession = (recommendation: Recommendation) => {
    setActiveSession(recommendation)
  }

  const handleCompleteSession = async () => {
    setShowFeedback(true)
  }

  const handleSubmitFeedback = async (rating: number, feedback: string) => {
    if (activeSession && session?.user?.id) {
      try {
        await fetch('/api/user-content-interaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: session.user.id,
            contentId: activeSession.id,
            rating,
            feedback,
          }),
        })
        setToast({
          title: 'Feedback Submitted',
          description: 'Thank you for your feedback!',
        })
      } catch (error) {
        console.error('Error saving user interaction:', error)
        setToast({
          title: 'Error',
          description: 'Failed to save your feedback. Please try again later.',
        })
      }
    }
    setShowFeedback(false)
    setActiveSession(null)
  }

  if (status === 'loading' || loading) {
    return <div>Loading personalized recommendations...</div>
  }

  if (status === 'unauthenticated') {
    return <div>Please sign in to view personalized recommendations.</div>
  }

  return (
    <ToastProvider>
      {activeSession && !showFeedback ? (
        <MeditationSession
          title={activeSession.title}
          duration={activeSession.duration}
          onComplete={handleCompleteSession}
        />
      ) : showFeedback ? (
        <FeedbackForm
          contentId={activeSession!.id}
          onSubmit={handleSubmitFeedback}
          onClose={() => {
            setShowFeedback(false)
            setActiveSession(null)
          }}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Zender AI Recommendations</CardTitle>
            <CardDescription>Personalized content based on your profile and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recommendations.map((item) => (
                <li key={item.id}>
                  <Card>
                    <CardHeader>
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription>{item.type} • {item.duration} minutes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>{item.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={() => handleStartSession(item)}>Start Session</Button>
                    </CardFooter>
                  </Card>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      <ToastViewport />
      {toast && (
        <Toast>
          <ToastTitle>{toast.title}</ToastTitle>
          <ToastDescription>{toast.description}</ToastDescription>
        </Toast>
      )}
    </ToastProvider>
  )
}
