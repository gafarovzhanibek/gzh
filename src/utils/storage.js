// In-memory store — no size limits, data lost on page refresh (re-upload required)
let _data = null;
let _meta = null;

export function saveData(processedData, filename, rowCount) {
  _data = processedData;
  _meta = { filename, rowCount };
  return true;
}

export function loadData() {
  return _data;
}

export function loadMeta() {
  return _meta;
}

export function clearData() {
  _data = null;
  _meta = null;
}
