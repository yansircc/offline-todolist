'use client'

import { useTodoStore } from '@/lib/store'
import { useState } from 'react'

export function UserRegistration() {
  const { setUserInfo } = useTodoStore()
  const [nickname, setNickname] = useState('')
  const [groupId, setGroupId] = useState<number>(1)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate input
    if (!nickname.trim()) {
      setError('Please enter a nickname')
      return
    }
    
    if (groupId < 1 || groupId > 10) {
      setError('Group ID must be between 1 and 10')
      return
    }
    
    // Save user info
    setUserInfo({
      nickname: nickname.trim(),
      groupId,
      isRegistered: true
    })
    
    setError(null)
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-4">Welcome to Todo List</h2>
      <p className="text-gray-600 mb-6">
        Please enter your nickname and group number to get started.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
            Nickname
          </label>
          <input
            type="text"
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your nickname"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="groupId" className="block text-sm font-medium text-gray-700 mb-1">
            Group Number (1-10)
          </label>
          <select
            id="groupId"
            value={groupId}
            onChange={(e) => setGroupId(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                Group {num}
              </option>
            ))}
          </select>
        </div>
        
        {error && (
          <div className="mb-4 p-2 bg-red-50 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Start Using Todo List
        </button>
      </form>
    </div>
  )
} 