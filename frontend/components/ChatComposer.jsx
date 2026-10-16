import { MESSAGE_MAX_LENGTH, QUICK_REPLIES } from '../lib/chat';

export default function ChatComposer({
  body,
  busy,
  onBodyChange,
  onSend,
  onQuickReply,
}) {
  return (
    <form className="mt-6 rounded-2xl bg-white p-4 shadow-sm" onSubmit={onSend}>
      <div className="flex flex-wrap gap-2">
        {QUICK_REPLIES.map(item => (
          <button
            key={item}
            type="button"
            className="hello-chip"
            disabled={busy}
            onClick={() => onQuickReply(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <label className="mt-4 block text-sm font-semibold text-[#32251F]">
        Message
        <input
          value={body}
          maxLength={MESSAGE_MAX_LENGTH}
          disabled={busy}
          onChange={event => onBodyChange(event.target.value)}
          placeholder="A short note for the group"
          className="mt-2 w-full rounded-xl border border-[#E8D9C8] bg-[#FFF8EF] p-3 text-[#32251F]"
        />
      </label>
      <p className="mt-1 text-sm text-[#6B5348]">{body.length}/{MESSAGE_MAX_LENGTH}</p>
      <button type="submit" className="mt-3" disabled={busy || !body.trim()}>
        {busy ? 'Sending…' : 'Send'}
      </button>
    </form>
  );
}
