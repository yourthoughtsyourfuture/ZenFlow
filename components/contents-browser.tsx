'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Content {
  id: string
  title: string
  description: string
  type: string
  category: string
  duration: number
  difficulty: string
  tags: string[]
  audioUrl: string
  imageUrl: string | null
}

export function ContentBrowser() {
  const { data: session, status } = useSession()
  const [content, setContent] = useState<Content[]>([])
  const [filteredContent, setFilteredContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')

  useEffect(() => {
    async function fetchContent() {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/content')
          if (response.ok) {
            const data = await response.json()
            setContent(data)
            setFilteredContent(data)
          } else {
            throw new Error('Failed to fetch content')
          }
        } catch (error) {
          console.error('Error fetching content:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    if (status === 'authenticated') {
      fetchContent()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [session, status])

  useEffect(() => {
    const filtered = content.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = selectedCategory === '' || item.category === selectedCategory
      const matchesDifficulty = selectedDifficulty === '' || item.difficulty === selectedDifficulty
      return matchesSearch && matchesCategory && matchesDifficulty
    })
    setFilteredContent(filtered)
  }, [content, searchTerm, selectedCategory, selectedDifficulty])

  if (status === 'loading' || loading) {
    return <div>Loading content...</div>
  }

  if (status === 'unauthenticated') {
    return <div>Please sign in to browse meditation content.</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <Input
          type="text"
          placeholder="Search meditations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            <SelectItem value="mindfulness">Mindfulness</SelectItem>
            <SelectItem value="relaxation">Relaxation</SelectItem>
            <SelectItem value="compassion">Compassion</SelectItem>
            <SelectItem value="energy">Energy</SelectItem>
            <SelectItem value="spiritual">Spiritual</SelectItem>
            <SelectItem value="positive-psychology">Positive Psychology</SelectItem>
            <SelectItem value="sleep">Sleep</SelectItem>
            <SelectItem value="manifestation">Manifestation</SelectItem>
            <SelectItem value="mental-health">Mental Health</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            
            <SelectItem value="">All Difficulties</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContent.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.category} • {item.duration} minutes • {item.difficulty}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{item.description}</p>
              <div className="mt-2">
                {item.tags.map((tag, index) => (
                  <span key={index} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    #{tag}
                  </span>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button>Start Session</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
