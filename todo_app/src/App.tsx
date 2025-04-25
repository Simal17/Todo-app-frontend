import { useState } from "react"
import { gql, useMutation, useQuery } from "@apollo/client"
import { Button } from "./components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { getColumns, Task } from "@/components/ui/columns"
import { EditDialog } from "./components/ui/editDialog"
import { CreateTaskDialog } from "./components/ui/createDialog"
import { format } from "date-fns"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"


const GET_TASKS = gql`
  query {
    tasks {
      id
      name
      category
      description
      isFinished
      createdDate
      dueDate
      priority
    }
  }
`

const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id) {
      success
      message
    }
  }
`

const CREATE_TASK = gql`
  mutation CreateTask($input: TaskInput!) {
    createTask(input: $input) {
      success
      message
      task {
        id
        name
      }
    }
  }
`

const GENERATE_TASK = gql`
  mutation GenerateTask($existing: [String!]!) {
    generateTask(existing: $existing)
  }
`

//parse the generated output from LLM to an object
function parseGeneratedTask(text: string): {
  name: string
  category: string
  description: string
  priority: number
  dueDate: string
} | null {
  try {
    const lines = text.split("\n").map(line => line.trim()).filter(Boolean)
    const obj: any = {}

    const keyMap: Record<string, string> = {
      name: "name",
      category: "category",
      description: "description",
      priority: "priority",
      duedate: "dueDate"
    }

    for (const line of lines) {
      const [key, ...rest] = line.split(":")
      if (!key || rest.length === 0) continue

      const rawKey = key.trim().toLowerCase()
      const value = rest.join(":").trim()
      if (!value || !(rawKey in keyMap)) continue

      const normalizedKey = keyMap[rawKey]

      if (normalizedKey === "priority") {
        const parsedPriority = parseInt(value)
        obj.priority = isNaN(parsedPriority) ? undefined : parsedPriority
      } else {
        obj[normalizedKey] = value
      }
    }

    if (
      !obj.name ||
      !obj.category ||
      !obj.dueDate ||
      !obj.hasOwnProperty("priority")
    ) {
      return null
    }

    return obj as {
      name: string
      category: string
      description: string
      priority: number
      dueDate: string
    }

  } catch (err) {
    console.error("Error parsing generated task:", err)
    return null
  }
}


function App() {
  const { data: queryData, loading: loadingTasks, error: queryError, refetch } = useQuery(GET_TASKS)
  const [deleteTask] = useMutation(DELETE_TASK)
  const [createTask] = useMutation(CREATE_TASK)
  const [generateTaskMutation, { loading: generating }] = useMutation(GENERATE_TASK)

  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [openCreate, setOpenCreate] = useState(false)

  const handleGenerateTask = async () => {
    const existing = queryData?.tasks.map((t: Task) => `${t.name} - ${t.category} - ${t.description} - ${t.createdDate} - ${t.dueDate} - ${t.priority}`) ?? []
  
    try {
      const result = await generateTaskMutation({ variables: { existing } })
      const generatedRaw = result.data.generateTask
      const parsed = parseGeneratedTask(generatedRaw)

      if (parsed) {
        await createTask({
          variables: {
            input: {
              name: parsed.name,
              category: parsed.category,
              description: parsed.description || "AI-generated task",
              isFinished: false,
              createdDate: format(new Date(), "yyyy-MM-dd"),
              dueDate: parsed.dueDate,
              priority: parsed.priority,
            },
          },
        })
  
        toast.success("Generated task added!")
        refetch()
      } else {
        toast.error("Could not parse generated task")
      }
    } catch (err) {
      console.error("Failed to generate task:", err)
      toast.error("Task generation failed")
    }
  }
  

  const columns = getColumns(setEditingTask, (id: number) => {
    deleteTask({ variables: { id } })
    refetch()
  })

  return (
    <>
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold">Zach's Todo Task Dashboard</h1>

        <div className="flex gap-x-2">
          <Button onClick={() => setOpenCreate(true)}>Add New Task</Button>
          <Button variant="outline" onClick={handleGenerateTask} disabled={generating}>
            {generating ? "Generating..." : "Generate New Task"}
          </Button>
        </div>

        <div>
          <h2 className="text-xl font-semibold">All Tasks</h2>
          {loadingTasks ? (
            <p className="text-gray-500">Loading tasks...</p>
          ) : queryError ? (
            <p className="text-red-500">Error loading tasks: {queryError.message}</p>
          ) : (
            <DataTable columns={columns} data={queryData?.tasks ?? []} />
          )}
        </div>

        {editingTask && (
          <EditDialog
            task={editingTask}
            open={true}
            onClose={() => setEditingTask(null)}
            refetch={refetch}
          />
        )}

        <CreateTaskDialog
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          refetch={refetch}
        />
        <Toaster />
      </div>
    </>
  )
}

export default App
