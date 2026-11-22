import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { planPending, previewMigration, runMigration } from './runner.mjs';
import { fieldsOf, resetEmulator, seed, text, versionOf } from './test-setup.mjs';

describe('Migration 0.5.0', () => {
  beforeEach(resetEmulator);

  it('Should only raise the version and the minVersion to 0.5.0, leaving every other document as it was', async () => {
    const entry = { kind: text('oneOffBill'), month: text('2026-10'), amountCents: { integerValue: '4000' } };
    const tags = { items: { mapValue: { fields: { t1: { mapValue: { fields: { name: text('Casa') } } } } } } };
    await seed('settings/app', { version: text('0.0.0'), minVersion: text('0.4.0') });
    await seed('entries/e1', entry);
    await seed('settings/tags', tags);

    // A 0.5.0 não escreve nada além da versão: a prévia não tem escrita nenhuma.
    assert.deepEqual(await previewMigration('0.5.0'), []);
    await runMigration('0.5.0');

    assert.deepEqual(await fieldsOf('settings/app'), versionOf('0.5.0'));
    assert.deepEqual(await fieldsOf('entries/e1'), entry);
    assert.deepEqual(await fieldsOf('settings/tags'), tags);
  });

  it('Should stay out of the plan while the package is still at 0.4.1', async () => {
    await seed('settings/app', { version: text('0.0.0') });

    assert.deepEqual(await planPending('0.4.1'), []);
  });
});
