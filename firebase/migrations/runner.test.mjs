import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { migrationsIn, planPending, previewMigration, runMigration } from './runner.mjs';
import { fieldsOf, makeMigrationsDir, markDone, resetEmulator, seed, text, versionOf } from './test-setup.mjs';

describe('migrationsIn', () => {
  it('Should sort the versions as numbers, with 0.10.0 after 0.9.0', () => {
    const dir = makeMigrationsDir({ '0.10.0': '', '0.2.0': '', '0.9.0': '', '1.0.0': '' });

    assert.deepEqual(migrationsIn(dir), ['0.2.0', '0.9.0', '0.10.0', '1.0.0']);
  });

  it('Should ignore the files that are not a migration', () => {
    const dir = makeMigrationsDir({ '0.1.0': '', '0.1.0.test': '', init: '', notes: '' });

    assert.deepEqual(migrationsIn(dir), ['0.1.0']);
  });
});

describe('runMigration', () => {
  beforeEach(resetEmulator);

  it('Should write the migration, the version and the minVersion when the database is at the previous version', async () => {
    // Cada migração marca um documento: rodar a anterior no lugar da pedida marcaria o `a`.
    const dir = makeMigrationsDir({ '0.1.0': markDone('a'), '0.2.0': markDone('b') });
    await seed('settings/app', versionOf('0.1.0'));
    await seed('entries/a', { done: { booleanValue: false } });
    await seed('entries/b', { done: { booleanValue: false } });

    await runMigration('0.2.0', { dir });

    assert.deepEqual(await fieldsOf('entries/b'), { done: { booleanValue: true } });
    assert.deepEqual(await fieldsOf('entries/a'), { done: { booleanValue: false } });
    assert.deepEqual(await fieldsOf('settings/app'), versionOf('0.2.0'));
  });

  it('Should run the first migration on a database at 0.0.0', async () => {
    const dir = makeMigrationsDir({ '0.1.0': markDone('a') });
    await seed('settings/app', { version: text('0.0.0'), minVersion: text('0.4.0') });

    await runMigration('0.1.0', { dir });

    assert.deepEqual(await fieldsOf('settings/app'), versionOf('0.1.0'));
  });

  it('Should refuse a migration when the database skipped the one before it, and write nothing', async () => {
    const dir = makeMigrationsDir({ '0.1.0': markDone('a'), '0.2.0': markDone('a'), '0.3.0': markDone('a') });
    await seed('settings/app', versionOf('0.1.0'));
    await seed('entries/a', { done: { booleanValue: false } });

    await assert.rejects(runMigration('0.3.0', { dir }), /na versão 0\.2\.0, e ele está na 0\.1\.0/);

    assert.deepEqual(await fieldsOf('entries/a'), { done: { booleanValue: false } });
    assert.deepEqual(await fieldsOf('settings/app'), versionOf('0.1.0'));
  });

  it('Should refuse a migration that already ran, and write nothing', async () => {
    const dir = makeMigrationsDir({ '0.1.0': markDone('a'), '0.2.0': markDone('a') });
    await seed('settings/app', versionOf('0.2.0'));
    await seed('entries/a', { done: { booleanValue: false } });

    await assert.rejects(runMigration('0.2.0', { dir }), /na versão 0\.1\.0, e ele está na 0\.2\.0/);

    assert.deepEqual(await fieldsOf('entries/a'), { done: { booleanValue: false } });
    assert.deepEqual(await fieldsOf('settings/app'), versionOf('0.2.0'));
  });

  it('Should leave nothing written when the commit fails, the migration and the version together', async () => {
    // A segunda escrita tem um valor que a API recusa: o commit inteiro falha, e a primeira não pode ficar.
    const dir = makeMigrationsDir({
      '0.1.0': `export default async function migrate(tx) {
        return [
          { update: { name: tx.name('entries/a'), fields: { done: { booleanValue: true } } } },
          { update: { name: tx.name('entries/b'), fields: { done: { notAValueType: true } } } },
        ];
      }`,
    });
    await seed('settings/app', versionOf('0.0.0'));
    await seed('entries/a', { done: { booleanValue: false } });

    await assert.rejects(runMigration('0.1.0', { dir }));

    assert.deepEqual(await fieldsOf('entries/a'), { done: { booleanValue: false } });
    assert.deepEqual(await fieldsOf('settings/app'), versionOf('0.0.0'));
  });

  // O tempo-limite é o que prova a trava solta: uma trava presa deixaria o `seed` do fim parado.
  it('Should leave no write, no new version and no lock when the migration throws', { timeout: 15000 }, async () => {
    const dir = makeMigrationsDir({
      '0.1.0': `export default async function migrate(tx) {
        await tx.get('entries/a');
        throw new Error('quebrou no meio');
      }`,
    });
    await seed('settings/app', versionOf('0.0.0'));
    await seed('entries/a', { done: { booleanValue: false } });

    await assert.rejects(runMigration('0.1.0', { dir }), /quebrou no meio/);

    assert.deepEqual(await fieldsOf('settings/app'), versionOf('0.0.0'));
    assert.deepEqual(await fieldsOf('entries/a'), { done: { booleanValue: false } });
    // A trava do documento lido já foi solta: uma escrita comum não espera por ela.
    await seed('entries/a', { done: { booleanValue: true } });
  });

  describe('with expectedWrites', () => {
    // Copia o `count` de `entries/a` para `entries/copy`: as escritas dependem do que o banco tem na hora.
    const copyCount = `export default async function migrate(tx) {
      const { fields } = await tx.get('entries/a');
      return [{ update: { name: tx.name('entries/copy'), fields: { count: fields.count } } }];
    }`;

    it('Should write when the migration returns the writes that were previewed', async () => {
      const dir = makeMigrationsDir({ '0.1.0': copyCount });
      await seed('settings/app', versionOf('0.0.0'));
      await seed('entries/a', { count: { integerValue: '1' } });
      const expectedWrites = await previewMigration('0.1.0', { dir });

      await runMigration('0.1.0', { dir, expectedWrites });

      assert.deepEqual(await fieldsOf('entries/copy'), { count: { integerValue: '1' } });
      assert.deepEqual(await fieldsOf('settings/app'), versionOf('0.1.0'));
    });

    it('Should abort without writing when the writes changed since the preview', async () => {
      const dir = makeMigrationsDir({ '0.1.0': copyCount });
      await seed('settings/app', versionOf('0.0.0'));
      await seed('entries/a', { count: { integerValue: '1' } });
      const expectedWrites = await previewMigration('0.1.0', { dir });
      await seed('entries/a', { count: { integerValue: '2' } });

      await assert.rejects(runMigration('0.1.0', { dir, expectedWrites }), /mudaram/);

      assert.equal(await fieldsOf('entries/copy'), undefined);
      assert.deepEqual(await fieldsOf('settings/app'), versionOf('0.0.0'));
    });
  });
});

describe('previewMigration', () => {
  beforeEach(resetEmulator);

  it('Should return the writes of the migration without saving anything', async () => {
    const dir = makeMigrationsDir({ '0.1.0': markDone('a') });
    await seed('settings/app', versionOf('0.0.0'));
    await seed('entries/a', { done: { booleanValue: false } });

    const writes = await previewMigration('0.1.0', { dir });

    assert.equal(writes.length, 1);
    assert.match(writes[0].update.name, /\/documents\/entries\/a$/);
    assert.deepEqual(await fieldsOf('entries/a'), { done: { booleanValue: false } });
    assert.deepEqual(await fieldsOf('settings/app'), versionOf('0.0.0'));
  });
});

describe('planPending', () => {
  beforeEach(resetEmulator);

  const dir = () => makeMigrationsDir({ '0.4.0': '', '0.5.0': '', '0.6.0': '', '0.7.0': '' });

  it('Should refuse a database without settings/app and tell to run the init', async () => {
    await assert.rejects(planPending('0.6.0', { dir: dir() }), /pnpm migrate:init/);
  });

  it('Should refuse a database that has settings/app but no version', async () => {
    await seed('settings/app', { minVersion: text('0.4.0') });

    await assert.rejects(planPending('0.6.0', { dir: dir() }), /pnpm migrate:init/);
  });

  it('Should return only the migrations after the database version, up to the target', async () => {
    await seed('settings/app', versionOf('0.5.0'));

    assert.deepEqual(await planPending('0.6.0', { dir: dir() }), ['0.6.0']);
  });

  it('Should return nothing when the database is at the target', async () => {
    await seed('settings/app', versionOf('0.6.0'));

    assert.deepEqual(await planPending('0.6.0', { dir: dir() }), []);
  });

  it('Should refuse a database whose version is not three numbers separated by dots', async () => {
    await seed('settings/app', { version: text('0,5,0') });

    await assert.rejects(planPending('0.6.0', { dir: dir() }), /"0,5,0"/);
  });

  it('Should refuse a database above the target', async () => {
    await seed('settings/app', versionOf('0.7.0'));

    await assert.rejects(planPending('0.6.0', { dir: dir() }), /0\.7\.0/);
  });
});
