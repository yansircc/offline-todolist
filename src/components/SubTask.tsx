'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { type SubTask as SubTaskType } from '@/lib/store'
import { cn } from '@/lib/utils'

interface SubTaskProps {
  subTask: SubTaskType
  stageId: string
  taskId: string
  onToggleCompletion: (stageId: string, taskId: string, subTaskId: string) => void
}

export function SubTask({ subTask, stageId, taskId, onToggleCompletion }: SubTaskProps) {
  return (
    <div className="border-l border-gray-200 py-2 pl-6">
      <div className="flex items-start gap-2">
        <Checkbox
          id={`subtask-${subTask.id}`}
          checked={subTask.completed}
          onChange={() => onToggleCompletion(stageId, taskId, subTask.id)}
          className="mt-0.5"
        />
        <div className="flex-1">
          <h4
            className={cn('text-sm font-medium', subTask.completed && 'text-gray-500 line-through')}
          >
            {subTask.title}
          </h4>
          {subTask.description && (
            <p className={cn('mt-1 text-sm text-gray-600', subTask.completed && 'text-gray-400')}>
              {subTask.description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
