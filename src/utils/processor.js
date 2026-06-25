function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = typeof key === 'function' ? key(item) : item[key];
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

export function normalizeRow(row) {
  const normalized = {};
  for (const [k, v] of Object.entries(row)) {
    normalized[k.trim()] = v;
  }
  return normalized;
}

export const REQUIRED_COLS = ['Serial Number', 'Абонент', 'OLT', 'PON Port', 'Модель'];

export function validateColumns(rows) {
  if (!rows || rows.length === 0) return { valid: false, missing: REQUIRED_COLS };
  const firstRow = normalizeRow(rows[0]);
  const keys = Object.keys(firstRow);
  const missing = REQUIRED_COLS.filter(col => !keys.includes(col));
  return { valid: missing.length === 0, missing };
}

const KEEP_COLS = ['Serial Number', 'Абонент', 'OLT', 'PON Port', 'Модель'];

function slimRow(row) {
  const out = {};
  for (const k of KEEP_COLS) out[k] = row[k] ?? '';
  return out;
}

export function processData(rows) {
  const normalized = rows.map(normalizeRow);

  const isActive = r => r['Модель'] && String(r['Модель']).trim() !== '';
  const inactive = normalized.filter(r => !isActive(r)).map(slimRow);

  // duplicates by serial
  const serialGroups = groupBy(normalized, 'Serial Number');
  const dupSerials = Object.entries(serialGroups)
    .filter(([k, v]) => k && String(k).trim() && v.length > 1)
    .flatMap(([, v]) => v.map(slimRow));

  // duplicates by subscriber
  const subGroups = groupBy(normalized, 'Абонент');
  const dupSubscribers = Object.entries(subGroups)
    .filter(([k, v]) => k && String(k).trim() && v.length > 1)
    .flatMap(([, v]) => v.map(slimRow));

  const hasPort = r => /\d/.test(String(r['PON Port'] ?? ''));

  // port stats — exclude rows where PON Port is empty or "/"
  const assignedRows = normalized.filter(hasPort);
  const portGroups = groupBy(assignedRows, r => `${r['OLT']}|||${r['PON Port']}`);
  const ports = Object.entries(portGroups).map(([key, items]) => {
    const [olt, port] = key.split('|||');
    const total = items.length;
    const activeCount = items.filter(isActive).length;
    const status = total > 64 ? 'overloaded' : total < 10 ? 'underloaded' : 'normal';
    return { olt, port, total, active: activeCount, inactive: total - activeCount, status };
  });

  // OLT stats
  const oltGroups = groupBy(normalized, 'OLT');
  const olts = Object.entries(oltGroups).map(([olt, items]) => {
    const total = items.length;
    const activeCount = items.filter(isActive).length;
    const oltPorts = ports.filter(p => p.olt === olt);
    const portCount = oltPorts.length;
    const assigned = items.filter(hasPort).length;
    const avgPerPort = portCount ? (assigned / portCount).toFixed(1) : 0;
    const maxOnPort = oltPorts.length ? Math.max(...oltPorts.map(p => p.total)) : 0;
    const dupCount = dupSerials.filter(r => r['OLT'] === olt).length;
    return {
      olt, total, active: activeCount, inactive: total - activeCount,
      activePct: total ? ((activeCount / total) * 100).toFixed(1) : 0,
      portCount, avgPerPort, maxOnPort, duplicates: dupCount
    };
  });

  return {
    inactive,
    dupSerials,
    dupSubscribers,
    ports,
    olts,
    summary: {
      total: normalized.length,
      activeCount: normalized.length - inactive.length,
      inactiveCount: inactive.length,
      activePct: normalized.length ? (((normalized.length - inactive.length) / normalized.length) * 100).toFixed(1) : 0,
      dupSerial: dupSerials.length,
      dupSubscriber: dupSubscribers.length,
      oltCount: Object.keys(oltGroups).length,
      portCount: ports.length,
      overloadedPorts: ports.filter(p => p.status === 'overloaded').length,
    }
  };
}
