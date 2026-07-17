// Modello di configurazione per connessione Supabase
// Copia questo file rinominandolo in 'config.js' e inserisci i tuoi parametri reali.
const config = {
  SUPABASE_URL: "https://your-project-id.supabase.co",
  SUPABASE_ANON_KEY: "your-supabase-anon-key-here",
  // URL di reindirizzamento dopo il reset della password (usata in login.html)
  PASSWORD_RECOVERY_REDIRECT_URL: "https://www.tuosito.com/login.html",
  // Email dell'amministratore (riceve copia delle credenziali Guest create dall'Admin Panel)
  ADMIN_EMAIL: "tua@email.com",
  // EmailJS (opzionale) — compila per l'invio automatico delle email
  // EMAILJS_SERVICE_ID: "service_xxxxxxx",
  // EMAILJS_TEMPLATE_ID: "template_xxxxxxx",       // Template approvazione clienti normali
  // EMAILJS_GUEST_TEMPLATE_ID: "template_xxxxxxx", // Template credenziali Guest
  // EMAILJS_PUBLIC_KEY: "xxxxxxxxxxxxxxx"
};
