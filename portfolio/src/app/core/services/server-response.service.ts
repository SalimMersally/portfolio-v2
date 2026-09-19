import { inject, Injectable, RESPONSE_INIT } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ServerResponseService {
  private readonly response = inject(RESPONSE_INIT, { optional: true });

  setStatus(status: number): void {
    if (this.response) {
      this.response.status = status;
    }
  }
}
