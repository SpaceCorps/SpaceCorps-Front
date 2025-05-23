import { Injectable, isDevMode } from '@angular/core';
import { UserCredentialsCreateRequest } from '../models/auth/UserCredentialsCreateRequest';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserCredentialsLoginRequest } from '../models/auth/UserCredentialsLoginRequest';
import { GetPlayerInfoRequest } from '../models/player/GetPlayerInfoRequest';
import { PlayerData } from '../models/player/PlayerData';
import { SpaceMapDataEntry } from '../models/dataEntries/SpaceMapDataEntry';
import { UpdateSpaceMapDataEntryRequest } from '../models/dataEntries/UpdateSpaceMapDataEntryRequest';
import { CreateStaticEntityRequest } from '../models/entity/CreateStaticEntityRequest';
import { DeleteStaticEntityRequest } from '../models/entity/DeleteStaticEntityRequest';
import { ServerInfo } from '../models/servers/ServerInfo';
import { BuyItemRequest } from '../models/player/BuyItemRequest';
import { Inventory } from '../models/player/Inventory';
import { SellableItems } from '../models/player/Items';
import { Commit } from '../components/github-timeline/commit';
import {
  EquipEngineRequest,
  EquipLaserAmpRequest,
  EquipLaserRequest,
  EquipShieldCellRequest,
  EquipShieldRequest,
  EquipThrusterRequest,
  UnequipEngineRequest,
  UnequipLaserAmpRequest,
  UnequipLaserRequest,
  UnequipShieldCellRequest,
  UnequipShieldRequest,
  UnequipThrusterRequest,
} from '../models/player/EquipUnequipDtos';
import { ChapterProgressDto } from '../models/lore/ChapterProgressDto';
import { ClanData, ClanInvitation } from '../models/clan/ClanData';
import {
  CreateClanRequest,
  InviteToClanRequest,
  ClanSearchRequest,
  UpdateMemberStatsRequest,
} from '../models/clan/ClanDtos';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private url = isDevMode()
    ? 'http://localhost:5274/api'
    : 'http://179.61.190.125:5274/api';
  private githubApiUrl =
    'https://api.github.com/repos/rorychatt/SpaceCorps-Front/commits?per_page=1000';

  constructor(private http: HttpClient) {}

  createNewUser(request: UserCredentialsCreateRequest) {
    return this.http.post<PlayerData>(
      `${this.url}/UserCredentials/Create`,
      request
    );
  }

  logIn(request: UserCredentialsLoginRequest) {
    return this.http.post<PlayerData>(
      `${this.url}/UserCredentials/Verify`,
      request
    );
  }

  getPlayerInfo(request: GetPlayerInfoRequest) {
    return this.http.get<PlayerData>(`${this.url}/Players/${request.username}`);
  }

  getAllPlayers() {
    return this.http.get<PlayerData[]>(`${this.url}/Players/All`);
  }

  getSpaceMapDataEntryNames() {
    return this.http.get<string[]>(
      `${this.url}/SpaceMapDataEntries/GetAllNames`
    );
  }

  getSpaceMapDataEntry(name: string) {
    return this.http.get<SpaceMapDataEntry>(
      `${this.url}/SpaceMapDataEntries/Get/${name}`
    );
  }

  postSpaceMapDataEntry(mapName: string) {
    return this.http.post<SpaceMapDataEntry>(
      `${this.url}/SpaceMapDataEntries/Add`,
      { name: mapName }
    );
  }

  updateSpaceMapDataEntry(
    mapName: string,
    request: UpdateSpaceMapDataEntryRequest
  ) {
    return this.http.patch<SpaceMapDataEntry>(
      `${this.url}/SpaceMapDataEntries/Update/${mapName}`,
      request
    );
  }

  deleteSpaceMapDataEntry(mapName: string) {
    return this.http.delete(
      `${this.url}/SpaceMapDataEntries/Delete/${mapName}`
    );
  }

  addStaticEntityToMap(
    selectedSpaceMapDataEntryName: string,
    newStaticEntity: CreateStaticEntityRequest
  ) {
    return this.http.post(
      `${this.url}/SpaceMapDataEntries/addStaticEntityToSpaceMap/${selectedSpaceMapDataEntryName}`,
      newStaticEntity
    );
  }

  deleteStaticEntityFromMap(
    mapName: string,
    staticEntity: DeleteStaticEntityRequest
  ) {
    return this.http.delete(
      `${this.url}/SpaceMapDataEntries/deleteStaticEntityFromSpaceMap/${mapName}`,
      { body: staticEntity }
    );
  }

  getItemEntriesByCategory(category: SellableItems['itemType']) {
    return this.http.get<SellableItems[]>(
      `${this.url}/ItemEntries/${category}s`
    );
  }

  createNewItemEntry<T extends SellableItems>(newItem: T) {
    return this.http.post<T>(
      `${this.url}/ItemEntries/${newItem.itemType.replace('Entrie', '')}s/Add`,
      newItem
    );
  }

  deleteItemEntry<T extends SellableItems>(item: T) {
    return this.http.delete(
      `${this.url}/ItemEntries/${item.itemType.replace('Entrie', '')}s/Delete`,
      { body: { id: item.id } }
    );
  }

  getBackendVersion() {
    return this.http.get<ServerInfo>(`${this.url}/Servers/Info`);
  }

  buyItem(buyItemRequest: BuyItemRequest) {
    return this.http.post(`${this.url}/Shops/ShipYard/Buy`, buyItemRequest, {
      responseType: 'text' as 'json',
    });
  }

  handleUserEditorCommand(command: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<void>(
      `${this.url}/Players/UserEditorCommand`,
      JSON.stringify(command),
      { headers, responseType: 'text' as 'json' }
    );
  }

  getUserInventory(username: string) {
    return this.http.get<Inventory>(
      `${this.url}/Players/Inventory/${username}`
    );
  }

  equipLaserAmp(equipLaserAmpRequest: EquipLaserAmpRequest) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(
      `${this.url}/Players/EquipLaserAmp`,
      equipLaserAmpRequest,
      { headers, responseType: 'text' as 'json' }
    );
  }

  unequipLaserAmp(unequipLaserAmpRequest: UnequipLaserAmpRequest) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(
      `${this.url}/Players/UnequipLaserAmp`,
      unequipLaserAmpRequest,
      { headers, responseType: 'text' as 'json' }
    );
  }

  equipShieldCell(equipShieldCellRequest: EquipShieldCellRequest) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(
      `${this.url}/Players/EquipShieldCell`,
      equipShieldCellRequest,
      { headers, responseType: 'text' as 'json' }
    );
  }

  unequipShieldCell(unequipShieldCellRequest: UnequipShieldCellRequest) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(
      `${this.url}/Players/UnequipShieldCell`,
      unequipShieldCellRequest,
      { headers, responseType: 'text' as 'json' }
    );
  }

  equipLaser(equipLaserRequest: EquipLaserRequest) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.url}/Players/EquipLaser`, equipLaserRequest, {
      headers,
      responseType: 'text' as 'json',
    });
  }

  unequipLaser(unequipLaserRequest: UnequipLaserRequest) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(
      `${this.url}/Players/UnequipLaser`,
      unequipLaserRequest,
      { headers, responseType: 'text' as 'json' }
    );
  }

  equipShield(equipShieldRequest: EquipShieldRequest) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(
      `${this.url}/Players/EquipShield`,
      equipShieldRequest,
      { headers, responseType: 'text' as 'json' }
    );
  }

  unequipShield(unequipShieldRequest: UnequipShieldRequest) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(
      `${this.url}/Players/UnequipShield`,
      unequipShieldRequest,
      { headers, responseType: 'text' as 'json' }
    );
  }

  equipEngine(equipEngineRequest: EquipEngineRequest) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(
      `${this.url}/Players/EquipEngine`,
      equipEngineRequest,
      { headers, responseType: 'text' as 'json' }
    );
  }

  unequipEngine(unequipEngineRequest: UnequipEngineRequest) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(
      `${this.url}/Players/UnequipEngine`,
      unequipEngineRequest,
      { headers, responseType: 'text' as 'json' }
    );
  }

  equipThruster(equipThrusterRequest: EquipThrusterRequest) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(
      `${this.url}/Players/EquipThruster`,
      equipThrusterRequest,
      { headers, responseType: 'text' as 'json' }
    );
  }

  unequipThruster(unequipThrusterRequest: UnequipThrusterRequest) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(
      `${this.url}/Players/UnequipThruster`,
      unequipThrusterRequest,
      { headers, responseType: 'text' as 'json' }
    );
  }

  getChapterProgress(userId: string) {
    return this.http.get<ChapterProgressDto>(
      `${this.url}/Lore/Progress/${userId}`
    );
  }

  updateChapterProgress(request: ChapterProgressDto) {
    return this.http.post<void>(`${this.url}/Lore/Progress`, request);
  }

  getGithubCommits() {
    return this.http.get<Commit[]>(this.githubApiUrl);
  }

  // Clan endpoints
  getClan(id: string) {
    return this.http.get<ClanData>(`${this.url}/Clans/${id}`);
  }

  getAllClans() {
    return this.http.get<ClanData[]>(`${this.url}/Clans`);
  }

  getClanMember(username: string) {
    return this.http.get<ClanData>(`${this.url}/Clans/member/${username}`);
  }

  createClan(request: CreateClanRequest) {
    return this.http.post<ClanData>(`${this.url}/Clans`, request);
  }

  searchClans(params: ClanSearchRequest) {
    return this.http.get<ClanData[]>(`${this.url}/Clans/search`, {
      params: params as Record<string, string | number | boolean>,
    });
  }

  inviteToClan(clanId: string, request: InviteToClanRequest) {
    return this.http.post<void>(`${this.url}/Clans/${clanId}/invite`, request);
  }

  acceptClanInvitation(inviteId: string) {
    return this.http.post<void>(
      `${this.url}/Clans/invitations/${inviteId}/accept`,
      {}
    );
  }

  declineClanInvitation(inviteId: string) {
    return this.http.post<void>(
      `${this.url}/Clans/invitations/${inviteId}/decline`,
      {}
    );
  }

  getClanInvitations(username: string) {
    return this.http.get<ClanInvitation[]>(
      `${this.url}/Clans/invitations/${username}`
    );
  }

  joinClan(clanId: string, username: string) {
    return this.http.post<void>(
      `${this.url}/Clans/${clanId}/join`,
      JSON.stringify(username),
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      }
    );
  }

  promoteMember(clanId: string, username: string) {
    return this.http.post<void>(
      `${this.url}/Clans/${clanId}/promote`,
      JSON.stringify(username),
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      }
    );
  }

  demoteMember(clanId: string, username: string) {
    return this.http.post<void>(
      `${this.url}/Clans/${clanId}/demote`,
      JSON.stringify(username),
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      }
    );
  }

  updateMemberActivity(clanId: string, username: string, isOnline: boolean) {
    return this.http.post<void>(
      `${this.url}/Clans/${clanId}/members/${username}/activity`,
      JSON.stringify(isOnline),
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    );
  }

  updateMemberStats(
    clanId: string,
    username: string,
    request: UpdateMemberStatsRequest
  ) {
    return this.http.post<void>(
      `${this.url}/Clans/${clanId}/members/${username}/stats`,
      request
    );
  }

  kickMember(clanId: string, request: { kickerUsername: string; memberToKick: string }) {
    return this.http.post(`${this.url}/Clans/${clanId}/kick`, request);
  }

  deleteClan(clanId: string, username: string) {
    return this.http.delete(`${this.url}/Clans/${clanId}`, {
      body: username
    });
  }

  leaveClan(clanId: string, request: { username: string }) {
    return this.http.post(`${this.url}/Clans/${clanId}/leave`, request);
  }

  updateClan(request: {
    clanId: string;
    slogan: string;
    companyInfo: string;
    isRecruiting: boolean;
    minimumLevel: number;
    minimumRankingPoints: number;
  }) {
    return this.http.patch<ClanData>(
      `${this.url}/Clans/${request.clanId}`,
      request
    );
  }
}
