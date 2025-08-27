// Utility functions for exporting charts and data

function triggerDownload(uri, filename) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportSVGToPNG(svgElement, filename = 'chart.png', scale = 2) {
  if (!svgElement) return;
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  const bbox = svgElement.getBBox ? svgElement.getBBox() : { width: svgElement.clientWidth, height: svgElement.clientHeight };
  const width = Math.max(1, bbox.width || svgElement.clientWidth || 800);
  const height = Math.max(1, bbox.height || svgElement.clientHeight || 400);

  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(width * scale);
      canvas.height = Math.ceil(height * scale);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const png = canvas.toDataURL('image/png');
      triggerDownload(png, filename);
    } catch (e) {
      console.error('Export PNG failed:', e);
      URL.revokeObjectURL(url);
    }
  };
  img.onerror = () => {
    console.error('Failed to load SVG for PNG export');
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

export function exportDataToCSV(rows, headers, filename = 'data.csv') {
  if (!Array.isArray(rows) || rows.length === 0) return;
  const headerRow = headers.join(',');
  const escape = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const dataRows = rows.map(r => headers.map(h => escape(r[h])).join(','));
  const csv = [headerRow, ...dataRows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
