import { PendingTasks, PLATFORM_ID, TransferState, makeStateKey } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SanityClient } from '@sanity/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BlogSummary } from '../models/blog-summary.model';
import { SANITY_CLIENT } from './sanity-client.token';
import { SanityService } from './sanity.service';

const summary: BlogSummary = {
  _id: 'post-1',
  _updatedAt: '2026-09-17T10:20:30.456Z',
  title: 'Structured article',
  slug: 'structured-article',
  description: 'A useful article.',
  tags: ['Testing'],
  publishedAt: '2026-09-17T00:00:00.000Z',
};

describe('SanityService transfer state', () => {
  const client = { fetch: vi.fn() };
  const completePendingTask = vi.fn();
  const pendingTasks = { add: vi.fn(() => completePendingTask) };

  beforeEach(() => {
    client.fetch.mockReset();
    completePendingTask.mockReset();
    pendingTasks.add.mockClear();
  });

  function setup(platformId: 'server' | 'browser') {
    TestBed.configureTestingModule({
      providers: [
        SanityService,
        TransferState,
        { provide: PLATFORM_ID, useValue: platformId },
        { provide: SANITY_CLIENT, useValue: client as unknown as SanityClient },
        { provide: PendingTasks, useValue: pendingTasks },
      ],
    });

    return {
      service: TestBed.inject(SanityService),
      transferState: TestBed.inject(TransferState),
    };
  }

  it('stores a server result and completes its pending task', async () => {
    client.fetch.mockResolvedValue({ blogs: [summary] });
    const { service, transferState } = setup('server');

    await expect(service.getBlogs()).resolves.toEqual({ blogs: [summary] });

    expect(pendingTasks.add).toHaveBeenCalledOnce();
    expect(completePendingTask).toHaveBeenCalledOnce();
    expect(
      transferState.get(makeStateKey<{ blogs: BlogSummary[] }>('sanity:blogs'), { blogs: [] }),
    ).toEqual({ blogs: [summary] });
  });

  it('consumes transferred browser data without another Sanity request', async () => {
    const { service, transferState } = setup('browser');
    const key = makeStateKey<{ blogs: BlogSummary[] }>('sanity:blogs');
    transferState.set(key, { blogs: [summary] });

    await expect(service.getBlogs()).resolves.toEqual({ blogs: [summary] });

    expect(client.fetch).not.toHaveBeenCalled();
    expect(transferState.hasKey(key)).toBe(false);
  });

  it('completes its pending task when Sanity rejects', async () => {
    client.fetch.mockRejectedValue(new Error('Sanity unavailable'));
    const { service } = setup('server');

    await expect(service.getBlogs()).rejects.toThrow('Sanity unavailable');

    expect(completePendingTask).toHaveBeenCalledOnce();
  });
});
