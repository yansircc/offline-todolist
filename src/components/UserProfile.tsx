'use client'

import { useTodoStore } from '@/lib/store'
import { RefreshCcw, UserCircle } from 'lucide-react'
import { useState } from 'react'

export function UserProfile() {
  const { userInfo, resetUserInfo, resetAllData } = useTodoStore()
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  
  const { nickname, groupId, isRegistered } = userInfo
  
  if (!isRegistered) return null
  
  return (
    <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <UserCircle className="h-10 w-10 text-blue-500 mr-3" />
          <div>
            <h3 className="font-medium text-lg">{nickname}</h3>
            <p className="text-sm text-gray-600">Group {groupId}</p>
          </div>
        </div>
        
        <button
          onClick={() => setIsResetModalOpen(true)}
          className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <RefreshCcw className="h-4 w-4 mr-1.5" />
          Reset
        </button>
      </div>
      
      {/* Reset Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Reset Your Data</h3>
            <p className="text-gray-600 mb-6">
              What would you like to reset?
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => {
                  resetUserInfo()
                  setIsResetModalOpen(false)
                }}
                className="w-full py-2 px-4 bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 transition-colors"
              >
                Reset User Profile Only
                <div className="text-sm font-normal mt-1">
                  This will clear your nickname and group, but keep your task progress.
                </div>
              </button>
              
              <button
                onClick={() => {
                  resetAllData()
                  setIsResetModalOpen(false)
                }}
                className="w-full py-2 px-4 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
              >
                Reset Everything
                <div className="text-sm font-normal mt-1">
                  This will clear your profile and all task progress.
                </div>
              </button>
              
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="w-full py-2 px-4 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 