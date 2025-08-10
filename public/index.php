<!doctype html>
<html lang="pt-br">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>K7 • Login</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
      :root { --k7-black:#0e0e0e; --k7-gray-50:#f6f6f6; --k7-border:#e5e5e5; }
      html,body{height:100%;background:var(--k7-gray-50)}
      .auth-wrapper{min-height:100%;display:grid;place-items:center;padding:24px}
      .auth-card{max-width:420px;width:100%;border:1px solid var(--k7-border);border-radius:20px;box-shadow:0 10px 30px rgba(0,0,0,.06)}
      .auth-card .card-body{padding:32px}
      .k7-logo{font-weight:900;letter-spacing:-0.12em;color:var(--k7-black);line-height:1;font-size:clamp(40px,6vw,64px);font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,"Helvetica Neue",Arial}
      .k7-logo .k{margin-right:-0.02em}.k7-logo .seven{margin-left:-0.04em}
      .k7-badge{letter-spacing:.02em;font-weight:600;color:#6b7280}
      .form-label{font-weight:600;color:#374151}.form-control{padding:.8rem .9rem;border-radius:12px}
      .btn-k7{background:var(--k7-black);color:#fff;border-radius:12px;padding:.8rem;font-weight:700}
      .btn-k7:hover{filter:brightness(1.05)}.muted{color:#6b7280}.brand-line{height:1px;background:var(--k7-border)}
      .alert-fixed{position:absolute;top:12px;left:50%;transform:translateX(-50%);max-width:420px;width:calc(100% - 24px)}
    </style>
  </head>
  <body>
    <?php if (!empty($_GET['err'])): ?>
      <div class="alert alert-danger alert-fixed" role="alert">
        <?php echo htmlspecialchars($_GET['err']); ?>
      </div>
    <?php endif; ?>

    <div class="auth-wrapper">
      <div class="card auth-card bg-white">
        <div class="card-body">
          <div class="d-flex flex-column align-items-center text-center mb-3">
            <div class="k7-logo" aria-label="Logotipo K7"><span class="k">K</span><span class="seven">7</span></div>
            <div class="k7-badge mt-2">Pipeline • ERP</div>
          </div>
          <div class="brand-line mb-4"></div>

          <form action="/api/auth/login" method="post" novalidate>
            <div class="mb-3">
              <label for="email" class="form-label">E-mail</label>
              <input type="email" class="form-control" id="email" name="email" placeholder="seuemail@empresa.com" required>
            </div>
            <div class="mb-2">
              <label for="password" class="form-label">Senha</label>
              <input type="password" class="form-control" id="password" name="password" placeholder="••••••••" required>
            </div>
            <div class="d-flex align-items-center justify-content-between mb-4">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="1" id="remember" name="remember">
                <label class="form-check-label" for="remember">Lembrar de mim</label>
              </div>
              <a href="forgot-password.php" class="small text-decoration-none">Esqueci minha senha</a>
            </div>
            <button type="submit" class="btn btn-k7 w-100">Entrar</button>
          </form>

          <p class="text-center mt-4 mb-0 muted small">Ainda não tem acesso? <a href="#" class="text-reset">Fale com o administrador</a></p>
        </div>
      </div>
      <div class="text-center mt-3 muted small">© <span id="year"></span> K7</div>
    </div>
    <script>document.getElementById('year').textContent=new Date().getFullYear();</script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  </body>
</html>