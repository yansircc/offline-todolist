import { TodoList } from '@/components/TodoList'

// Revalidate page every 2 minutes
export const revalidate = 120

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <TodoList />
    </main>
  )
}
