// Modello di configurazione per connessione Supabase
// Copia questo file rinominandolo in 'config.js' e inserisci i tuoi parametri reali.
const config = {
  SUPABASE_URL: "https://your-project-id.supabase.co",
  SUPABASE_ANON_KEY: "your-supabase-anon-key-here",
  // URL di reindirizzamento dopo il reset della password (usata in login.html)
  PASSWORD_RECOVERY_REDIRECT_URL: "https://www.tuosito.com/login.html",
  // Email dell'amministratore (riceve copia delle credenziali Guest create dall'Admin Panel)
  ADMIN_EMAIL: "tua@email.com",
  // Resend API (invio automatico credenziali via email)
  RESEND_API_KEY: "re_xxxxxxxx_xxxxxxxxxxxxxxxxxxxxxxxx",
  RESEND_FROM: "Max Salvaggio <info@maxsalvaggio.com>"
};
