
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const initialTasks = [
  { id: 1, title: "Complete dashboard design", description: "Finish the FocusBoard dashboard UI.", category: "Design", status: "In progress", priority: "High", dueDate: "2026-11-24" },
  { id: 2, title: "Review project requirements", description: "Check all assessment requirements.", category: "Planning", status: "Completed", priority: "Medium", dueDate: "2026-11-20" },
  { id: 3, title: "Build responsive layout", description: "Optimize layout for mobile and tablet.", category: "Development", status: "To do", priority: "High", dueDate: "2026-11-25" },
  { id: 4, title: "Prepare documentation", description: "Write README and AI usage documentation.", category: "Documentation", status: "To do", priority: "Low", dueDate: "2026-11-27" },
  { id: 5, title: "Test task interactions", description: "Test editing, deleting and filtering.", category: "Testing", status: "In progress", priority: "Medium", dueDate: "2026-11-26" },
  { id: 6, title: "Deploy application", description: "Publish the project using Vercel.", category: "Deployment", status: "To do", priority: "High", dueDate: "2026-11-28" },
];

const notes = [
  { title: "Stay focused", description: "Break large projects into smaller, manageable tasks.", tag: "PRODUCTIVITY", color: "purple" },
  { title: "Make progress daily", description: "Consistent small improvements lead to big results.", tag: "DAILY HABIT", color: "blue" },
  { title: "Celebrate achievements", description: "Take a moment to recognize every completed task.", tag: "MOTIVATION", color: "orange" },
];

const emptyForm = {
  title: "",
  description: "",
  category: "General",
  status: "To do",
  priority: "Medium",
  dueDate: "",
};

function readTasks() {
  try {
    const saved = localStorage.getItem("focusboard-tasks");
    return saved ? JSON.parse(saved) : initialTasks;
  } catch {
    return initialTasks;
  }
}

function App() {
  const [tasks, setTasks] = useState(readTasks);
  const [activeTab, setActiveTab] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [activeNote, setActiveNote] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("focusboard-tasks", JSON.stringify(tasks));
    } catch {
      console.warn("Unable to save tasks in browser storage.");
    }
  }, [tasks]);

  const completed = tasks.filter(t => t.status === "Completed").length;
  const inProgress = tasks.filter(t => t.status === "In progress").length;
  const percentage = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesTab =
        activeTab === "All" || task.status === activeTab;
      const matchesPriority =
        priorityFilter === "All" || task.priority === priorityFilter;
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase());

      return matchesTab && matchesPriority && matchesSearch;
    });
  }, [tasks, activeTab, priorityFilter, search]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEdit(task) {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description,
      category: task.category,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
    });
    setError("");
    setShowForm(true);
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!form.title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    if (editingId !== null) {
      setTasks(previous =>
        previous.map(task =>
          task.id === editingId
            ? { ...task, ...form, title: form.title.trim() }
            : task
        )
      );
    } else {
      setTasks(previous => [
        {
          ...form,
          title: form.title.trim(),
          id: Date.now(),
        },
        ...previous,
      ]);
    }

    setShowForm(false);
    setForm(emptyForm);
    setError("");
  }

  function deleteTask(id) {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks(previous => previous.filter(task => task.id !== id));
    }
  }

  function changeStatus(id, status) {
    setTasks(previous =>
      previous.map(task =>
        task.id === id ? { ...task, status } : task
      )
    );
  }

  function changeNote(direction) {
    setActiveNote(previous =>
      (previous + direction + notes.length) % notes.length
    );
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">F</div>
          <span>FocusBoard</span>
        </div>

        <p className="nav-heading">MENU</p>
        <nav className="navigation" aria-label="Main navigation">
          <a href="#dashboard" className="nav-link active">
            <span>▦</span> Dashboard
          </a>
          <a href="#tasks" className="nav-link">
            <span>✓</span> My Tasks
          </a>
          <a href="#focus-notes" className="nav-link">
            <span>✎</span> Focus Notes
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-avatar">H</div>
          <div>
            <strong>My Workspace</strong>
            <small>Personal account</small>
          </div>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace / Dashboard</p>
            <h1>My Dashboard</h1>
          </div>
          <button className="primary-button" onClick={openCreate}>
            + Create Task
          </button>
        </header>

        <section className="welcome-section">
          <div>
            <p className="eyebrow">YOUR WORKSPACE</p>
            <h2>Good morning! 👋</h2>
            <p>Stay organized and make today productive.</p>
          </div>
          <div className="date-label">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </section>

        <section className="stats-grid" aria-label="Task statistics">
          <article className="stat-card">
            <div className="stat-top">
              <span>Total Tasks</span>
              <span className="stat-icon purple">▦</span>
            </div>
            <strong>{tasks.length}</strong>
            <small>All your tasks</small>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>In Progress</span>
              <span className="stat-icon blue">◷</span>
            </div>
            <strong>{inProgress}</strong>
            <small>Tasks being worked on</small>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Completed</span>
              <span className="stat-icon green">✓</span>
            </div>
            <strong>{completed}</strong>
            <small>Successfully finished</small>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Completion Rate</span>
              <span className="stat-icon orange">↗</span>
            </div>
            <strong>{percentage}%</strong>
            <div className="progress-track">
              <div style={{ width: `${percentage}%` }} />
            </div>
          </article>
        </section>

        <section className="focus-section" id="focus-notes">
          <div className="section-heading">
            <div>
              <p className="eyebrow">A LITTLE INSPIRATION</p>
              <h2>Focus Notes</h2>
            </div>
            <div className="carousel-controls">
              <button aria-label="Previous note" onClick={() => changeNote(-1)}>‹</button>
              <button aria-label="Next note" onClick={() => changeNote(1)}>›</button>
            </div>
          </div>

          <article className={`note-card ${notes[activeNote].color}`}>
            <span className="note-symbol">✦</span>
            <div>
              <small>{notes[activeNote].tag}</small>
              <h3>{notes[activeNote].title}</h3>
              <p>{notes[activeNote].description}</p>
            </div>
            <div className="note-dots" aria-label="Choose focus note">
              {notes.map((note, index) => (
                <button
                  key={note.title}
                  className={activeNote === index ? "selected" : ""}
                  aria-label={`Show note ${index + 1}`}
                  aria-pressed={activeNote === index}
                  onClick={() => setActiveNote(index)}
                />
              ))}
            </div>
          </article>
        </section>

        <section className="tasks-section" id="tasks">
          <div className="section-heading">
            <div>
              <p className="eyebrow">STAY ON TRACK</p>
              <h2>My Tasks</h2>
            </div>
            <button className="secondary-button" onClick={openCreate}>
              + Add Task
            </button>
          </div>

          <div className="task-toolbar">
            <div className="tabs" aria-label="Filter by status">
              {["All", "To do", "In progress", "Completed"].map(tab => (
                <button
                  key={tab}
                  className={activeTab === tab ? "tab active-tab" : "tab"}
                  onClick={() => setActiveTab(tab)}
                  aria-pressed={activeTab === tab}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="filters">
              <input
                type="search"
                placeholder="Search tasks..."
                aria-label="Search tasks by title"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <select
                aria-label="Filter by priority"
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
              >
                <option value="All">All priorities</option>
                <option value="High">High priority</option>
                <option value="Medium">Medium priority</option>
                <option value="Low">Low priority</option>
              </select>
            </div>
          </div>

          <div className="task-list">
            {filteredTasks.length === 0 ? (
              <div className="empty-state">
                <span>✦</span>
                <h3>No tasks found</h3>
                <p>Try another filter or create a new task.</p>
                <button className="primary-button" onClick={openCreate}>
                  Create Task
                </button>
              </div>
            ) : (
              filteredTasks.map(task => (
                <article className="task-row" key={task.id}>
                  <div className="task-main">
                    <div className={`task-check ${task.status === "Completed" ? "checked" : ""}`}>
                      {task.status === "Completed" ? "✓" : "○"}
                    </div>
                    <div className="task-info">
                      <h3>{task.title}</h3>
                      <p>{task.description}</p>
                      <div className="task-meta">
                        <span className="category">{task.category}</span>
                        {task.dueDate && (
                          <span>Due: {task.dueDate}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="task-actions">
                    <span className={`priority ${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                    <select
                      aria-label={`Status for ${task.title}`}
                      value={task.status}
                      onChange={e => changeStatus(task.id, e.target.value)}
                    >
                      <option>To do</option>
                      <option>In progress</option>
                      <option>Completed</option>
                    </select>
                    <button aria-label={`Edit ${task.title}`} onClick={() => openEdit(task)}>✎</button>
                    <button aria-label={`Delete ${task.title}`} onClick={() => deleteTask(task.id)}>×</button>
                  </div>
                </article>
              ))
            )}
          </div>
          <p className="results-count">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </p>
        </section>

        <footer className="footer">
          FocusBoard · Stay focused. Get things done.
        </footer>
      </main>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
        >
          <section className="task-modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
            <div className="modal-heading">
              <div>
                <p className="eyebrow">TASK MANAGEMENT</p>
                <h2 id="form-title">{editingId !== null ? "Edit Task" : "Create New Task"}</h2>
              </div>
              <button aria-label="Close form" onClick={() => setShowForm(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>
                Task Title *
                <input
                  autoFocus
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter task title"
                  required
                />
              </label>

              <label>
                Description
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your task"
                  rows="3"
                />
              </label>

              <label>
                Category
                <input
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Development"
                />
              </label>

              <div className="form-grid">
                <label>
                  Status
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                  >
                    <option>To do</option>
                    <option>In progress</option>
                    <option>Completed</option>
                  </select>
                </label>

                <label>
                  Priority
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </label>
              </div>

              <label>
                Due Date
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })}
                />
              </label>

              {error && <p className="form-error" role="alert">{error}</p>}

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  {editingId !== null ? "Save Changes" : "Create Task"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
