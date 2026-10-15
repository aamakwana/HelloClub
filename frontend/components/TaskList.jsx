export default function TaskList({ tasks, busy, onDelete }) {
  return (
    <>
      <ul className="mt-6 space-y-3">
        {tasks.map(task => (
          <li key={task.id} className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-4">
            <span className="break-words min-w-0">{task.title}</span>
            <button disabled={busy} aria-label={`Delete ${task.title}`} onClick={() => onDelete(task)}>Delete</button>
          </li>
        ))}
      </ul>
      {!tasks.length && <p className="mt-6 text-slate-500">No tasks yet. Add your first milestone.</p>}
    </>
  );
}
