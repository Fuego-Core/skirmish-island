// Notifications locales — fonctionnent tant que l'onglet/l'app reste chargé
// (premier plan ou arrière-plan proche). Le jeu est 100% statique (pas de
// serveur), donc impossible de réveiller l'app après une fermeture complète :
// ceci n'est pas du "vrai" push, juste un rappel pendant que l'app tourne.
const PREF_KEY = "skirmish-notifications-enabled";

export function notificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationsEnabled() {
  return notificationsSupported() && Notification.permission === "granted" && localStorage.getItem(PREF_KEY) === "1";
}

export async function enableNotifications() {
  if (!notificationsSupported()) return false;
  const perm = await Notification.requestPermission();
  if (perm === "granted") {
    localStorage.setItem(PREF_KEY, "1");
    return true;
  }
  return false;
}

export function disableNotifications() {
  localStorage.setItem(PREF_KEY, "0");
}

export async function notify(title, body) {
  if (!notificationsEnabled()) return;
  // Fond transparent (pas le carré plein utilisé pour l'icône d'app/manifest) :
  // sur fond de notification sombre, un carré quasi-noir se fondait dedans.
  const icon = `${import.meta.env.BASE_URL}icons/notif-icon-192.png`;
  try {
    if (navigator.serviceWorker) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        reg.showNotification(title, { body, icon, badge: icon, tag: "skirmish-island" });
        return;
      }
    }
    new Notification(title, { body, icon });
  } catch (e) {}
}
