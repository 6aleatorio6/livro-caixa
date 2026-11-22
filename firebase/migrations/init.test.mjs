import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { runInit } from './runner.mjs';
import { fieldsOf, resetEmulator, seed, text, versionOf } from './test-setup.mjs';

describe('runInit', () => {
  beforeEach(resetEmulator);

  it('Should write version 0.0.0 in a database without settings/app', async () => {
    await runInit();

    assert.deepEqual(await fieldsOf('settings/app'), { version: text('0.0.0') });
  });

  it('Should keep the minVersion that is already there', async () => {
    await seed('settings/app', { minVersion: text('0.4.0') });

    await runInit();

    assert.deepEqual(await fieldsOf('settings/app'), { minVersion: text('0.4.0'), version: text('0.0.0') });
  });

  it('Should refuse a database that already has a version, and write nothing', async () => {
    await seed('settings/app', versionOf('0.5.0'));

    await assert.rejects(runInit(), /O banco já tem a versão 0\.5\.0/);

    assert.deepEqual(await fieldsOf('settings/app'), versionOf('0.5.0'));
  });
});
