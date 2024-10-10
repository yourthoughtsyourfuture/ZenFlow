'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface SessionData {
  date: string
  duration: number
  rating: number
}

export function UserDashboard() {
  const { data: session, status } = useSession()
  const [sessionData, setSessionData] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserData() {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/user-progress')
          if (response.ok) {
            const data = await response.json()
            setSessionData(data)
          } else {
            throw new Error('Failed to fetch user progress data')
          }
        } catch (error) {
          console.error('Error fetching user progress data:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    if (status === 'authenticated') {
      fetchUserData()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [session, status])

  if (status === 'loading' || loading) {
    return <div>Loading user progress...</div>
  }

  if (status === 'unauthenticated') {
    return <div>Please sign in to view your meditation journey.</div>
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Your Meditation Journey</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={sessionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="duration" stroke="#8884d8" name="Duration (minutes)" />
            <Line yAxisId="right" type="monotone" dataKey="rating" stroke="#82ca9d" name="Rating" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
