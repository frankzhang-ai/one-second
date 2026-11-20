const capacitor = window.Capacitor;
export const isNative = !!(capacitor && capacitor.isNativePlatform && capacitor.isNativePlatform());
export const platform = isNative ? (capacitor.getPlatform?.() === 'ios' ? 'ios' : 'android') : 'web';

export function haptic(kind) {
  if (!isNative) return;
  try {
    const haptics = capacitor.Plugins?.Haptics;
    if (kind === 'level') haptics?.notification({ type: 'SUCCESS' });
    else if (kind === 'over') haptics?.notification({ type: 'ERROR' });
    else haptics?.impact({ style: kind === 'hit' ? 'LIGHT' : 'MEDIUM' });
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
