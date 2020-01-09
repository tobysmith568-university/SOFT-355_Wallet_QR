/* istanbul ignore file */
/*
  This file cannot be unit tested because it interacts with the session and local storage sysems
*/

import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class StorageService {

  public get(key: string): string {
    const sessionValue = sessionStorage.getItem(key);

    if (sessionValue !== null) {
      return sessionValue;
    }

    return localStorage.getItem(key);
  }

  public setSession(key: string, value: string) {
    sessionStorage.setItem(key, value);
  }

  public setLocal(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  public remove(key: string) {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  }
}
