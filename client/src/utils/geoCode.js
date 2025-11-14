export const reverseGeocodeSmart = async (coords) => {
  if (!coords || coords.length < 2) return null;

  const a = Number(coords[0]);
  const b = Number(coords[1]);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;

  const candidates = [
    { lat: b, lon: a },
    { lat: a, lon: b },
  ];

  const results = await Promise.all(
    candidates.map(async (c) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(
            c.lat
          )}&lon=${encodeURIComponent(c.lon)}&format=json&accept-language=en`
        );
        if (!res.ok) return null;
        const data = await res.json();
        const display = data?.display_name || "";
        return display.length > 0 ? display : null;
      } catch {
        return null;
      }
    })
  );

  const valid = results.filter(Boolean);
  if (valid.length === 0) return null;

  // Prefer longer / more descriptive result
  valid.sort((a, b) => b.length - a.length);
  return valid[0];
};
