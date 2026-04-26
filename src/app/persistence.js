const STORAGE_KEY = 'task5_inno_state_v1';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadPreloadedState() {
  if (!canUseStorage()) return undefined;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);

    return {
      auth: {
        token: parsed?.auth?.token ?? null,
        refreshToken: parsed?.auth?.refreshToken ?? null,
        user: parsed?.auth?.user ?? null,
      },
      app: {
        cart: parsed?.app?.cart ?? {},
      },
    };
  } catch {
    return undefined;
  }
}

export function saveStateSnapshot(state) {
  if (!canUseStorage()) return;

  const snapshot = {
    auth: {
      token: state?.auth?.token ?? null,
      refreshToken: state?.auth?.refreshToken ?? null,
      user: state?.auth?.user ?? null,
    },
    app: {
      cart: state?.app?.cart ?? {},
    },
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* ignore quota and privacy-mode errors */
  }
}
