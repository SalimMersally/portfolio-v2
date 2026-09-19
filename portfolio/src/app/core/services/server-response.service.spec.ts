import { RESPONSE_INIT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ServerResponseService } from './server-response.service';

describe('ServerResponseService', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('sets the SSR response status when RESPONSE_INIT is present', () => {
    const response = {} as ResponseInit;
    TestBed.configureTestingModule({ providers: [{ provide: RESPONSE_INIT, useValue: response }] });

    TestBed.inject(ServerResponseService).setStatus(503);

    expect(response.status).toBe(503);
  });

  it('is a no-op in the browser where RESPONSE_INIT is null', () => {
    TestBed.configureTestingModule({ providers: [{ provide: RESPONSE_INIT, useValue: null }] });

    expect(() => TestBed.inject(ServerResponseService).setStatus(404)).not.toThrow();
  });
});
