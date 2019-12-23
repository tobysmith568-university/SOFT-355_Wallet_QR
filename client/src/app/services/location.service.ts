/* istanbul ignore file */
/*
  This file cannot be unit tested because it interacts with the browser
*/

import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class LocationService {

  public reload(): void {
    location.reload();
  }
}
