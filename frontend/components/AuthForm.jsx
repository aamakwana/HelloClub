export default function AuthForm({ email, password, busy, onEmailChange, onPasswordChange, onSignIn, onSignUp }) {
  return (
    <>
      <h2 className="text-2xl font-semibold">Your workspace starts here</h2>
      <form className="mt-6 space-y-4" onSubmit={e => { e.preventDefault(); onSignIn(); }}>
        <label className="block">Email<input type="email" autoComplete="email" required value={email} onChange={e => onEmailChange(e.target.value)} /></label>
        <label className="block">Password<input type="password" autoComplete="current-password" minLength={8} required value={password} onChange={e => onPasswordChange(e.target.value)} /></label>
        <div className="flex gap-3">
          <button disabled={busy}>Sign in</button>
          <button type="button" disabled={busy || !email || password.length < 8} onClick={onSignUp}>Create account</button>
        </div>
      </form>
    </>
  );
}
