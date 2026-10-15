export default function TaskForm({ title, busy, onTitleChange, onAdd }) {
  return (
    <form className="mt-6 flex gap-3" onSubmit={e => { e.preventDefault(); onAdd(); }}>
      <input aria-label="New task" placeholder="What will you build?" maxLength={200} required value={title} onChange={e => onTitleChange(e.target.value)} />
      <button disabled={busy || !title.trim()}>Add</button>
    </form>
  );
}
