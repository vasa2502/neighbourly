import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";

interface GeocodingResult {
  display_name: string;
  lat: string;
  lon: string;
  address: Record<string, string>;
  place_id: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onCoordinates?: (lat: number, lng: number) => void;
  onAddressSelect?: (result: GeocodingResult) => void;
  placeholder?: string;
  className?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onCoordinates,
  onAddressSelect,
  placeholder = "Search for your community address...",
  className = "",
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const searchAddress = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        {
          headers: {
            "User-Agent": "JOINN-CommunityPlatform/1.0",
          },
        }
      );
      const data: GeocodingResult[] = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchAddress(val), 400);
  };

  const handleSelect = (result: GeocodingResult) => {
    onChange(result.display_name);
    setShowSuggestions(false);
    setSuggestions([]);

    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    if (onCoordinates) onCoordinates(lat, lng);
    if (onAddressSelect) onAddressSelect(result);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Input
          value={value}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="rounded-xl h-11 pr-8"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
          ) : (
            <MapPin className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border/40 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
          {suggestions.map((result) => (
            <button
              key={result.place_id}
              type="button"
              onClick={() => handleSelect(result)}
              className="w-full text-left px-4 py-3 hover:bg-muted/30 transition-colors border-b border-border/20 last:border-b-0"
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[hsl(155,45%,32%)] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{result.display_name}</p>
                  {result.address && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {[result.address.city, result.address.state, result.address.country].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Reverse Geocoding (for "Use My Location") ─── */

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      {
        headers: { "User-Agent": "JOINN-CommunityPlatform/1.0" },
      }
    );
    return await response.json();
  } catch {
    return null;
  }
}

/* ─── Get browser geolocation ─── */

export function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  });
}
