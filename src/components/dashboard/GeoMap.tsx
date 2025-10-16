import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

const mockLocations = [
  { country: "Brasil", city: "São Paulo", ip: "200.144.0.0", threats: 5, lat: -23.5, lng: -46.6 },
  { country: "EUA", city: "New York", ip: "198.51.100.0", threats: 12, lat: 40.7, lng: -74.0 },
  { country: "China", city: "Beijing", ip: "203.0.113.0", threats: 8, lat: 39.9, lng: 116.4 },
  { country: "Rússia", city: "Moscow", ip: "192.0.2.0", threats: 15, lat: 55.7, lng: 37.6 },
  { country: "Alemanha", city: "Berlin", ip: "198.18.0.0", threats: 3, lat: 52.5, lng: 13.4 },
];

export const GeoMap = () => {
  return (
    <div className="space-y-4">
      {/* Placeholder for actual map - would integrate with a real map library */}
      <div className="relative h-[400px] bg-muted/20 rounded-lg border border-border/50 flex items-center justify-center">
        <div className="text-center space-y-2">
          <MapPin className="h-12 w-12 text-primary mx-auto" />
          <p className="text-muted-foreground">
            Mapa interativo de geolocalização
          </p>
          <p className="text-sm text-muted-foreground">
            Visualização de origem dos IPs detectados
          </p>
        </div>
      </div>

      {/* Location List */}
      <div className="space-y-2">
        <h4 className="font-semibold text-sm">IPs Detectados por Localização</h4>
        <div className="space-y-2">
          {mockLocations.map((location, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/30 hover:bg-card/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium text-sm">
                    {location.city}, {location.country}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {location.ip}
                  </p>
                </div>
              </div>
              <Badge variant={location.threats > 10 ? "destructive" : "secondary"}>
                {location.threats} ameaças
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
