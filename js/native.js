const capacitor = window.Capacitor;
export const isNative = !!(capacitor && capacitor.isNativePlatform && capacitor.isNativePlatform());
export const platform = isNative ? (capacitor.getPlatform?.() === 'ios' ? 'ios' : 'android') : 'web';

export function haptic(kind) {
  if (!isNative) return;
  try {
    const style = kind === 'hit' ? 'LIGHT' : 'MEDIUM';
    capacitor.Plugins?.Haptics?.impact({ style });
  } catch {}
}

export function initNative({ onBack } = {}) {
  if (!isNative) return;
  try {
    const status = capacitor.Plugins?.StatusBar;
    status?.setStyle({ style: 'LIGHT' });
    if (platform === 'android') {
      status?.setBackgroundColor({ color: '#FAF7F0' });
      status?.setOverlaysWebView({ overlay: false });
    }
    if (onBack) capacitor.Plugins?.App?.addListener('backButton', onBack);
  } catch {}
}
