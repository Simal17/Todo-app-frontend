import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { gql, useMutation } from "@apollo/client"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from 'sonner';


export type Task = {
  id: number
  name: string
  category: string
  description: string
  isFinished: boolean
  createdDate: string
  dueDate: string
  priority: number
}

const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $input: TaskInput!) {
    updateTask(id: $id, input: $input) {
      success
      task {
        id
        isFinished
      }
    }
  }
`


export const getColumns = (
  setEditingTask: (task: Task) => void,
  onDeleteTask: (id: number) => void
): ColumnDef<Task>[] => [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "createdDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Created date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Due date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Priority
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    enableSorting: true,
    cell: ({ row }) => {
      const value = row.getValue("priority") as number
      const label = value === 1 ? "Low" : value === 2 ? "Medium" : "High"
      return <span className="font-medium">{label}</span>
    },
  },
  {
    accessorKey: "isFinished",
    header: "Completed",
    cell: ({ row }) => {
      const [updateTask] = useMutation(UPDATE_TASK)
      const task = row.original

      const toggleComplete = () => {
        updateTask({
          variables: {
            id: task.id,
            input: {
              name: task.name,
              category: task.category,
              description: task.description,
              createdDate: task.createdDate,
              dueDate: task.dueDate,
              priority: task.priority,
              isFinished: !task.isFinished,
            },
          },
        })
      }

      return (
        <Checkbox
          checked={task.isFinished}
          onCheckedChange={toggleComplete}
        />
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const task = row.original;
  
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditingTask(task)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                onDeleteTask(task.id);
                toast.success("Task deleted!");
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  }
]
