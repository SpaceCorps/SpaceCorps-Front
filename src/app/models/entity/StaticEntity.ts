export type StaticEntity = {
  name: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  id: number;
  locationName: string;
  safeZoneRadii: number;
  destination: string;
};
