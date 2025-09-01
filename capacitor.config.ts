import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'pololitos',
  webDir: 'www',
  // --- INICIO DE LA SECCIÓN A AÑADIR ---
  plugins: {
    Keyboard: {
      resize: 'none' // La opción 'none' evita que la vista se redimensione
    }
  }
  // --- FIN DE LA SECCIÓN A AÑADIR ---
};

export default config;