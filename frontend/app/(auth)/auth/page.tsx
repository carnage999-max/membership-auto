// Main Auth Page (Login/Signup)
import AuthForm from './AuthForm';

export default function AuthPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center mt-20 h-screen overflow-hidden bg-[var(--background)]">
      <div className="w-full max-w-md flex flex-col items-center justify-center flex-1">
        <AuthForm />
      </div>
    </div>
  );
}
