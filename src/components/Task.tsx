'use client'

import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { SubTask } from '@/components/SubTask'
import { Checkbox } from '@/components/ui/checkbox'
import { type Task as TaskType } from '@/lib/store'
import { cn } from '@/lib/utils'

interface TaskProps {
  task: TaskType
  stageId: string
  onToggleTaskCompletion: (stageId: string, taskId: string) => void
  onToggleSubTaskCompletion: (stageId: string, taskId: string, subTaskId: string) => void
}

export function Task({
  task,
  stageId,
  onToggleTaskCompletion,
  onToggleSubTaskCompletion,
}: TaskProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasSubTasks = task.subTasks.length > 0

  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="p-4">
        <div className="flex items-start gap-2">
          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onChange={() => onToggleTaskCompletion(stageId, task.id)}
            className="mt-0.5"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3
                className={cn(
                  'text-base font-medium',
                  task.completed && 'text-gray-500 line-through',
                )}
              >
                {task.title}
              </h3>
              {hasSubTasks && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
            {task.description && (
              <p className={cn('mt-1 text-sm text-gray-600', task.completed && 'text-gray-400')}>
                {task.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {hasSubTasks && isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 py-2">
          {task.subTasks.map((subTask) => (
            <SubTask
              key={subTask.id}
              subTask={subTask}
              stageId={stageId}
              taskId={task.id}
              onToggleCompletion={onToggleSubTaskCompletion}
            />
          ))}
        </div>
      )}
    </div>
  )
}
