import TaskForm from './TaskForm';
import TaskList from './TaskList';

export default function TaskWorkspace({ email, title, tasks, busy, onTitleChange, onAdd, onDelete, onSignOut }) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Your tasks</h2>
          <p className="text-sm text-slate-500">{email}</p>
        </div>
        <button disabled={busy} onClick={onSignOut}>Sign out</button>
      </div>
      <TaskForm title={title} busy={busy} onTitleChange={onTitleChange} onAdd={onAdd} />
      <TaskList tasks={tasks} busy={busy} onDelete={onDelete} />
    </>
  );
}
