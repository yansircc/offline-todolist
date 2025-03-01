"use client"

import { SubTask as SubTaskType } from "@/lib/store"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface SubTaskProps {
  subTask: SubTaskType
  stageId: string
  taskId: string
  onToggleCompletion: (stageId: string, taskId: string, subTaskId: string) => void
}

export function SubTask({ subTask, stageId, taskId, onToggleCompletion }: SubTaskProps) {
  return (
    <div className="pl-6 py-2 border-l border-gray-200">
      <div className="flex items-start gap-2">
        <Checkbox 
          id={`subtask-${subTask.id}`}
          checked={subTask.completed}
          onChange={() => onToggleCompletion(stageId, taskId, subTask.id)}
          className="mt-0.5"
        />
        <div className="flex-1">
          <h4 className={cn(
            "text-sm font-medium",
            subTask.completed && "line-through text-gray-500"
          )}>
            {subTask.title}
          </h4>
          {subTask.description && (
            <p className={cn(
              "text-sm text-gray-600 mt-1",
              subTask.completed && "text-gray-400"
            )}>
              {subTask.description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
} 