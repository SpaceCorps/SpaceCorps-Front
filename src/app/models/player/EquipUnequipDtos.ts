export type EquipLaserAmpRequest = {
  username: string;
  laserAmpId: number;
  laserId: number;
};

export type UnequipLaserAmpRequest = {
  username: string;
  laserAmpId: number;
  laserId: number;
};

export type EquipShieldCellRequest = {
  username: string;
  shieldCellId: number;
  shieldId: number;
};

export type UnequipShieldCellRequest = {
  username: string;
  shieldCellId: number;
  shieldId: number;
};

export type EquipThrusterRequest = {
  username: string;
  thrusterId: number;
  engineId: number;
};

export type UnequipThrusterRequest = {
  username: string;
  thrusterId: number;
  engineId: number;
};

export type EquipLaserRequest = {
  username: string;
  laserId: number;
  shipId: number;
};

export type UnequipLaserRequest = {
  username: string;
  laserId: number;
  shipId: number;
};

export type EquipEngineRequest = {
  username: string;
  engineId: number;
  shipId: number;
};

export type UnequipEngineRequest = {
  username: string;
  engineId: number;
  shipId: number;
};

export type EquipShieldRequest = {
  username: string;
  shieldId: number;
  shipId: number;
};

export type UnequipShieldRequest = {
  username: string;
  shieldId: number;
  shipId: number;
};
