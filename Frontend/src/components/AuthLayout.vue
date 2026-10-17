<template>
  <div class="login-layout">
    <section class="brand-panel">
      <div class="brand-logo-lg">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h12M6 10h12"/></svg>
      </div>
      <h1>EasyNotes</h1>
      <p class="brand-sub">Sistema de gestión académica</p>
    </section>

    <section class="form-panel">
      <div class="login-card">
        <slot />
      </div>
    </section>
  </div>
</template>

<style scoped>
.login-layout { display: flex; width: 100vw; min-height: 100vh; background-color: #f1f5f9; }
.brand-panel {
  width: 42%; background: linear-gradient(180deg, #1e40af 0%, #1d4ed8 100%);
  color: white; padding: 60px 48px; display: flex; flex-direction: column; justify-content: center;
}
.brand-logo-lg {
  background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px); width: 56px; height: 56px;
  border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;
}
.brand-panel h1 { font-size: 30px; font-weight: 800; }
.brand-sub { font-size: 13px; color: #bfdbfe; margin-top: 6px; }
.form-panel { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px 24px; }
.login-card {
  background: white; width: 100%; max-width: 400px; padding: 32px; border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03); border: 1px solid rgba(226, 232, 240, 0.8);
}
@media (max-width: 900px) {
  .login-layout { flex-direction: column; }
  .brand-panel { width: 100%; padding: 32px 24px; }
}
</style>
