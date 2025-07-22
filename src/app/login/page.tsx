import LoginForm from './login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-8 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/30 via-slate-950 to-slate-950" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(148, 163, 184, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(148, 163, 184, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
          }}
        />
      </div>
      
      {/* Centered Login Form */}
      <div className="relative z-10 w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
