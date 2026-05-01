import './App.css'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";


function Home() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col w-full items-center justify-center gap-4 min-h-screen">
      <h1 className="title text-5xl" >
        <span className="task">Task</span>
        <span className="due">Due</span>
      </h1>

      <h2>"Manage Tasks in one place"</h2>

      <button
        onClick={() => navigate('/tasks')}
        className="bg-black hover:bg-gray-800 text-white font-bold px-5 py-2 rounded-md transition"
      >
        Manage Tasks
      </button>
    </div>
  )
}

type Task = {
  id: number;
  title: string;
  category: string;
  dueDate: string;
  status: "Not Started" | "In Progress" | "Completed";
  priority: "Low" | "Medium" | "High";
};

function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showFindTaskModal, setShowFindTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);

  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("School");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<"Not Started" | "In Progress" | "Completed">("Not Started");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");

  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("School");
  const [editDueDate, setEditDueDate] = useState("");
  const [editStatus, setEditStatus] = useState<"Not Started" | "In Progress" | "Completed">("Not Started");
  const [editPriority, setEditPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => { //run this code when it first loads the page, and only then
    async function fetchTasks() {
      try {
        const response = await fetch("http://localhost:3000/tasks"); // sends a request to backend
         
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        
        //converts data to actual json data that we can use in our frontend
        const data = await response.json();

        // map backend response to frontend Task type
        const formattedTasks: Task[] = data.map((task: any) => ({
          id: task.task_id,
          title: task.title,
          category: task.category,
          dueDate: task.due_date,
          status: task.status,
          priority: task.priority,
        }));

        setTasks(formattedTasks); //updates the table with the data we got from the backend
      } catch (error) {
        console.error("Error loading tasks:", error);
      }
    }
    async function fetchCategories() {
      try {
        const response = await fetch("http://localhost:3000/categories");

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();
        setCategories(data.map((row: any) => row.category));
      } catch (error) {
        console.error("Error loading categories:", error);
      }
}

    fetchTasks();
    fetchCategories();
  }, []);


  const immediateTasks = tasks.filter(
    (task) => task.priority === "High" && task.status !== "Completed"
  );

  
  async function handleAddTask(e: React.FormEvent) { // a function that runs when a task is added
    e.preventDefault(); 

    if (!title.trim() || !dueDate) return;

    const newTask = { //object to send to the backend
      title: title.trim(),
      category,
      dueDate,
      status,
      priority,
    };

    try {
      const response = await fetch("http://localhost:3000/tasks", { // sends a request to backend
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        throw new Error("Failed to add task");
      }

      const data = await response.json(); //gets response from backend and converts it to json

      setTasks((prev) => [ //updates the table with the added task
        ...prev,
        {
          id: data.taskId,
          ...newTask,
        },
      ]);

      //resets the form to default
      setTitle("");
      setCategory("School");
      setDueDate("");
      setStatus("Not Started");
      setPriority("Medium");
      setShowAddTaskModal(false);
      setShowFindTaskModal(false);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  }

  function openEditModal(task: Task) { //opens the edit popup and fills in the current values of the task
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditCategory(task.category);
    setEditDueDate(task.dueDate);
    setEditStatus(task.status);
    setEditPriority(task.priority);
    setShowEditTaskModal(true);
  }

  async function handleEditTask(e: React.FormEvent) { 
  e.preventDefault();

  if (editingTaskId === null) return;

  //creates the updated task object to send to the backend
  const updatedTask = {
    title: editTitle,
    category: editCategory,
    dueDate: editDueDate,
    status: editStatus,
    priority: editPriority,
  };

  try {
    const response = await fetch( // uses HTTP method PUT to update the task in the backend
      `http://localhost:3000/tasks/${editingTaskId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTask),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update task");
    }

    // replace the edited task with the same id with the updated task in the frontend
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === editingTaskId
          ? { ...task, ...updatedTask }
          : task
      )
    );

    setShowEditTaskModal(false);
    setEditingTaskId(null);
  } catch (error) {
    console.error("Error updating task:", error);
  }
}

  async function handleDeleteTask(taskId: number) { 
  try {
    const response = await fetch(`http://localhost:3000/tasks/${taskId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete task");
    }

    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId)); // keep all tasks except the one with the same task id as the deleted task
  } catch (error) {
    console.error("Error deleting task:", error);
  }
}

  async function handleFindTasks() {
  const params = new URLSearchParams();

  if (filterFromDate) params.append("fromDate", filterFromDate);
  if (filterToDate) params.append("toDate", filterToDate);
  if (filterStatus) params.append("status", filterStatus);
  if (filterPriority) params.append("priority", filterPriority);

  try {
    const response = await fetch(
      `http://localhost:3000/tasks/filter?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error("Failed to filter tasks");
    }

    const data = await response.json();

    const formattedTasks: Task[] = data.map((task: any) => ({
      id: task.task_id,
      title: task.title,
      category: task.category,
      dueDate: task.due_date,
      status: task.status,
      priority: task.priority,
    }));

    setTasks(formattedTasks); // replace tasks with filtered results
    setShowFindTaskModal(false);
    setIsFiltered(true);
  } catch (error) {
    console.error("Error finding tasks:", error);
  }
}

async function handleResetFilters() {
  try {
    const response = await fetch("http://localhost:3000/tasks");

    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }

    const data = await response.json();

    const formattedTasks: Task[] = data.map((task: any) => ({
      id: task.task_id,
      title: task.title,
      category: task.category,
      dueDate: task.due_date,
      status: task.status,
      priority: task.priority,
    }));

    setTasks(formattedTasks);

    setFilterFromDate("");
    setFilterToDate("");
    setFilterStatus("");
    setFilterPriority("");

    setIsFiltered(false);
  } catch (error) {
    console.error("Error resetting filters:", error);
  }
}

  return (
    <div className="min-h-screen bg-white px-8 py-6">
      <div className="relative mb-10">
        <Link to="/" className="absolute top-0 left-0 inline-block">
          <h1 className="title text-3xl cursor-pointer">
            <span className="task">Task</span>
            <span className="due">Due</span>
          </h1>
        </Link>

        <div className="flex justify-center">
          <h2 className="text-4xl font-bold mt-2">Task Dashboard</h2>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex justify-end gap-3">
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="bg-gray-200 hover:bg-gray-300 text-black font-bold px-5 py-2 rounded-md transition"
            >
              Reset Filters
            </button>
          )}
          <button
            onClick={() => setShowFindTaskModal(true)}
            className="bg-black hover:bg-gray-800 text-white font-bold px-5 py-2 rounded-md transition"
          >
            Find Task
          </button>
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="bg-black hover:bg-gray-800 text-white font-bold px-5 py-2 rounded-md transition"
          >
            Add Task
          </button>
        </div>

        {showAddTaskModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="absolute top-3 right-4 text-2xl text-gray-500 hover:text-black"
              >
                ×
              </button>

              <h3 className="text-2xl font-semibold mb-5">Create Task</h3>

              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Status</label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "Not Started" | "In Progress" | "Completed")
                    }
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as "Low" | "Medium" | "High")
                    }
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddTaskModal(false)}
                    className="border px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="bg-black hover:bg-gray-800 text-white font-bold px-5 py-2 rounded-md transition"
                  >
                    Save Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditTaskModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
              <button
                onClick={() => setShowEditTaskModal(false)}
                className="absolute top-3 right-4 text-2xl text-gray-500 hover:text-black"
              >
                ×
              </button>

              <h3 className="text-2xl font-semibold mb-5">Edit Task</h3>

              <form onSubmit={handleEditTask} className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Due Date</label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(e.target.value as "Not Started" | "In Progress" | "Completed")
                    }
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) =>
                      setEditPriority(e.target.value as "Low" | "Medium" | "High")
                    }
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditTaskModal(false)}
                    className="border px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="bg-black hover:bg-gray-800 text-white font-bold px-5 py-2 rounded-md transition"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showFindTaskModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">

              <button
                onClick={() => setShowFindTaskModal(false)}
                className="absolute top-3 right-4 text-2xl text-gray-500 hover:text-black"
              >
                ×
              </button>

              <h3 className="text-2xl font-semibold mb-5">Find Tasks</h3>

              <div className="space-y-4">

                <div>
                  <label className="block mb-1">From Date</label>
                  <input
                    type="date"
                    value={filterFromDate}
                    onChange={(e) => setFilterFromDate(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block mb-1">To Date</label>
                  <input
                    type="date"
                    value={filterToDate}
                    onChange={(e) => setFilterToDate(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block mb-1">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">Any</option>
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Priority</label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">Any</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <button
                  onClick={handleFindTasks}
                  className="bg-black text-white w-full py-2 rounded-md"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        <section>
          <h3 className="text-2xl font-semibold mb-4 text-center">Immediate Tasks</h3>
          <div className="overflow-x-auto border rounded-lg shadow-sm">
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 text-left border-b">Title</th>
                  <th className="px-6 py-3 text-left border-b">Category</th>
                  <th className="px-6 py-3 text-center border-b">Due Date</th>
                  <th className="px-6 py-3 text-center border-b">Status</th>
                  <th className="px-6 py-3 text-center border-b">Priority</th>
                  <th className="px-6 py-3 text-center border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {immediateTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500">
                      No immediate tasks
                    </td>
                  </tr>
                ) : (
                  immediateTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-left border-b">{task.title}</td>
                      <td className="px-6 py-3 text-left border-b">{task.category}</td>
                      <td className="px-6 py-3 text-center border-b">{task.dueDate}</td>
                      <td className="px-6 py-3 text-center border-b">{task.status}</td>
                      <td className="px-6 py-3 text-center border-b">{task.priority}</td>
                      <td className="px-6 py-3 text-center border-b">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openEditModal(task)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-semibold mb-4 text-center">All Tasks</h3>
          <div className="overflow-x-auto border rounded-lg shadow-sm">
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 text-left border-b">Title</th>
                  <th className="px-6 py-3 text-left border-b">Category</th>
                  <th className="px-6 py-3 text-center border-b">Due Date</th>
                  <th className="px-6 py-3 text-center border-b">Status</th>
                  <th className="px-6 py-3 text-center border-b">Priority</th>
                  <th className="px-6 py-3 text-center border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500">
                      No tasks yet
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-left border-b">{task.title}</td>
                      <td className="px-6 py-3 text-left border-b">{task.category}</td>
                      <td className="px-6 py-3 text-center border-b">{task.dueDate}</td>
                      <td className="px-6 py-3 text-center border-b">{task.status}</td>
                      <td className="px-6 py-3 text-center border-b">{task.priority}</td>
                      <td className="px-6 py-3 text-center border-b">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openEditModal(task)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tasks" element={<TasksPage />} />
    </Routes>
  )
}

export default App