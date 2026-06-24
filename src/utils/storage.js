const STORAGE_KEY = 'ont_monitor_data';
const META_KEY = 'ont_monitor_meta';

export function saveData(processedData, filename, rowCount) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(processedData));
    sessionStorage.setItem(META_KEY, JSON.stringify({ filename, rowCount }));
    return true;
  } catch (e) {
    console.error('Failed to save to sessionStorage:', e);
    return false;
  }
}

export function loadData() {
  try {
    const data = sessionStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

export function loadMeta() {
  try {
    const meta = sessionStorage.getItem(META_KEY);
    return meta ? JSON.parse(meta) : null;
  } catch (e) {
    return null;
  }
}

export function clearData() {
  sessionStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(META_KEY);
}
