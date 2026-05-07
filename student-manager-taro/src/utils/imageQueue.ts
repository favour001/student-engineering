type QueueTask = {
  id: number
  priority: number
  run: () => void
  canceled: boolean
}

const maxConcurrent = 3
let nextTaskId = 1
let activeCount = 0
const pendingTasks: QueueTask[] = []

export function enqueueImageLoad(priority: number, run: () => void) {
  const task: QueueTask = {
    id: nextTaskId++,
    priority,
    run,
    canceled: false
  }

  pendingTasks.push(task)
  flushImageQueue()

  return () => {
    task.canceled = true
  }
}

export function completeImageLoad() {
  activeCount = Math.max(0, activeCount - 1)
  flushImageQueue()
}

function flushImageQueue() {
  if (activeCount >= maxConcurrent) return

  pendingTasks.sort((a, b) => a.priority - b.priority || a.id - b.id)

  while (activeCount < maxConcurrent && pendingTasks.length) {
    const task = pendingTasks.shift()
    if (!task || task.canceled) continue

    activeCount += 1
    task.run()
  }
}
