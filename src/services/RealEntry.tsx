import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
export function RealEntry() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key)
    return (
      <div className="startup-error">
        <h1>Supabase de Occidental sin configurar</h1>
        <p>
          El modo real requiere URL y clave pública de un entorno identificado.
          No se cargan datos de demostración.
        </p>
      </div>
    );
  async function login(data: FormData) {
    setBusy(true);
    setMessage("");
    try {
      const supabase = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { error } = await supabase.auth.signInWithPassword({
        email: String(data.get("email")),
        password: String(data.get("password")),
      });
      if (error) throw error;
      const { data: membership, error: membershipError } = await supabase
        .from("memberships")
        .select("organization_id,role")
        .eq("active", true);
      if (membershipError) throw membershipError;
      if (!membership?.length) {
        await supabase.auth.signOut();
        throw new Error("Sin membresía activa autorizada.");
      }
      await supabase.auth.signOut();
      setMessage(
        "Credenciales verificadas. El panel operativo real todavía no está habilitado; completá el corte vertical y el gate de seguridad.",
      );
    } catch {
      setMessage(
        "No se pudo habilitar el acceso operativo. Revisá credenciales, membresía y configuración del entorno.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="startup-error">
      <h1>Occidental · Acceso real</h1>
      <p>
        Entorno sin habilitación operativa. Sin registro público de personal.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void login(new FormData(e.currentTarget));
        }}
      >
        <label className="field">
          Correo
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <label className="field">
          Contraseña
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        <button className="button primary" disabled={busy}>
          {busy ? "Verificando…" : "Verificar acceso"}
        </button>
        <p role="status">{message}</p>
      </form>
    </div>
  );
}
