export default function ChatButton({ planId }) {
  if (!planId) return null;
  return (
    <a
      className="mt-3 inline-block rounded-xl bg-[#C2410C] px-4 py-2 font-semibold text-white"
      href={`/chat/${planId}`}
    >
      Chat
    </a>
  );
}
