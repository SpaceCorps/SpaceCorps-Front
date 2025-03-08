import {Injectable, isDevMode} from '@angular/core';
import {UserCredentialsCreateRequest} from '../models/auth/UserCredentialsCreateRequest';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {UserCredentialsLoginRequest} from '../models/auth/UserCredentialsLoginRequest';
import {GetPlayerInfoRequest} from '../models/player/GetPlayerInfoRequest';
import {PlayerData} from '../models/player/PlayerData';
import {SpaceMapDataEntry} from '../models/dataEntries/SpaceMapDataEntry';
import {UpdateSpaceMapDataEntryRequest} from '../models/dataEntries/UpdateSpaceMapDataEntryRequest';
import {CreateStaticEntityRequest} from '../models/entity/CreateStaticEntityRequest';
import {DeleteStaticEntityRequest} from '../models/entity/DeleteStaticEntityRequest';
import {ServerInfo} from '../models/servers/ServerInfo';
import {BuyItemRequest} from '../models/player/BuyItemRequest';
import {Inventory} from '../models/player/Inventory';
import {SellableItems} from '../models/player/Items';
import {EquipLaserAmpRequest} from '../models/player/EquipLaserAmpRequest';

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  private url = isDevMode() ? 'http://localhost:5274/api' : 'http://179.61.190.125:5274/api';

  constructor(private http: HttpClient) {
  }

  createNewUser(request: UserCredentialsCreateRequest) {
    return this.http.post(`${this.url}/UserCredentials/Create`, request);
  }

  logIn(request: UserCredentialsLoginRequest) {
    return this.http.post(`${this.url}/UserCredentials/Verify`, request);
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
      {name: mapName}
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
      {body: staticEntity}
    );
  }

  getItemEntriesByCategory(category: SellableItems['itemType']) {
    return this.http.get(`${this.url}/ItemEntries/${category}s`);
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
      {body: {id: item.id}}
    );
  }

  getBackendVersion() {
    return this.http.get<ServerInfo>(`${this.url}/Servers/Info`);
  }

  buyItem(buyItemRequest: BuyItemRequest) {
    return this.http.post(`${this.url}/Shops/ShipYard/Buy`, buyItemRequest, {
      responseType: "text" as "json"
    });
  }

  handleUserEditorCommand(command: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post<void>(
      `${this.url}/Players/UserEditorCommand`,
      JSON.stringify(command),
      {headers, responseType: "text" as "json"}
    );
  }

  getUserInventory(username: string) {
    return this.http.get<Inventory>(`${this.url}/Players/Inventory/${username}`);
  }

  equipLaserAmp(equipLaserAmpRequest: EquipLaserAmpRequest) {
    return this.http.post(`${this.url}/Players/EquipLaserAmp`, equipLaserAmpRequest, {});
  }
}
