type Props = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const nextPath = params.next && params.next.startsWith("/") ? params.next : "/";
  const hasError = params.error === "1";

  return (
    <section className="login-shell">
      <div className="login-card">
        <p className="eyebrow">Acesso protegido</p>
        <h1>FILOMENA GASTRONOMIE</h1>
        <p className="login-text">Digite a senha para entrar no sistema.</p>

        <form className="login-form" action="/api/auth/login" method="post">
          <input type="hidden" name="next" value={nextPath} />

          <label>
            <span>Senha</span>
            <input type="password" name="password" placeholder="Sua senha de acesso" required />
          </label>

          <button className="primary-button" type="submit">
            Entrar
          </button>
        </form>

        {hasError ? <p className="feedback">Senha incorreta. Tente novamente.</p> : null}
      </div>
    </section>
  );
}
