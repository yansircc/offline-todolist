'use client'

import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Task } from '@/components/Task'
import { Separator } from '@/components/ui/separator'
import { type Stage as StageType } from '@/lib/store'

interface StageProps {
  stage: StageType
  onToggleTaskCompletion: (stageId: string, taskId: string) => void
  onToggleSubTaskCompletion: (stageId: string, taskId: string, subTaskId: string) => void
}

export function Stage({ stage, onToggleTaskCompletion, onToggleSubTaskCompletion }: StageProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasTasks = stage.tasks.length > 0

  // Calculate completion percentage
  const totalTasks = stage.tasks.length
  const completedTasks = stage.tasks.filter((task) => task.completed).length
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
          aria-label={isExpanded ? 'Collapse stage' : 'Expand stage'}
        >
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
        <h2 className="flex-1 text-xl font-bold">{stage.title}</h2>
        <div className="text-sm text-gray-500">
          {completedTasks}/{totalTasks} completed ({completionPercentage}%)
        </div>
      </div>

      {stage.description && <p className="mb-4 pl-7 text-gray-600">{stage.description}</p>}

      <div className="mb-4 h-2.5 w-full rounded-full bg-gray-200">
        <div
          className="h-2.5 rounded-full bg-blue-600"
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>

      {isExpanded && (
        <div className="pl-7">
          {hasTasks ? (
            stage.tasks.map((task) => (
              <Task
                key={task.id}
                task={task}
                stageId={stage.id}
                onToggleTaskCompletion={onToggleTaskCompletion}
                onToggleSubTaskCompletion={onToggleSubTaskCompletion}
              />
            ))
          ) : (
            <p className="italic text-gray-500">No tasks in this stage</p>
          )}
        </div>
      )}

      <Separator className="mt-8" />
    </div>
  )
}
