export default function AuthShell({
    heroTitle,
    heroText,
    children,
    belowCardText,
}) {
    return (
        <div className="min-h-screen bg-[var(--bg)] px-4 py-10 sm:px-6">
            <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[1100px] flex-col justify-center gap-12 lg:flex-row lg:items-center lg:justify-between">
                <section className="w-full max-w-[560px] text-center lg:text-left">
                    <div className="facebook-wordmark">FlowFeed</div>
                    <p className="mt-4 max-w-[520px] text-[1.75rem] leading-[1.18] text-[var(--text)] sm:text-[2rem] lg:text-[3.5rem] lg:leading-[1.04]">
                        {heroTitle}
                    </p>
                    <p className="mx-auto mt-5 max-w-[480px] text-base leading-7 text-[var(--muted)] lg:mx-0 lg:text-lg">
                        {heroText}
                    </p>
                </section>

                <section className="w-full max-w-[396px] shrink-0">
                    <div className="auth-card animate-rise">{children}</div>

                    {belowCardText ? (
                        <p className="mt-7 text-center text-sm leading-6 text-[var(--text)]">
                            {belowCardText}
                        </p>
                    ) : null}
                </section>
            </div>
        </div>
    );
}
