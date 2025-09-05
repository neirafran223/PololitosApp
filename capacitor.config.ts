import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'pololitos',
  webDir: 'www',
  plugins: {
    // --- INICIO DE LA SECCIÓN A AÑADIR/MODIFICAR ---
    SplashScreen: {
      launchShowDuration: 3000, // Duración en milisegundos (3 segundos)
      launchAutoHide: true, // Se oculta automáticamente
      backgroundColor: '#0B1426', // Color de fondo que debe coincidir con tu splash
      androidScaleType: 'CENTER_CROP', // Cómo se ajusta la imagen en Android
      splashFullScreen: true,
      splashImmersive: true,
    },
    // --- FIN DE LA SECCIÓN ---
    Keyboard: {
      resize: 'none'
    }
  }
};

export default config;