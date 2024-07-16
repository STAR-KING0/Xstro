let options = {
  bot_: "temp JSON DEFAULT '{}' ",
  sck1: "rank JSON DEFAULT '{}' ",
  sck: 'disables TEXT[] DEFAULT ARRAY[]::TEXT[] ',
  tempdb: "creator TEXT DEFAULT 'Xstro_Md'",
};
let optJson = {
  bot_: {},
  sck1: {
    rank: {},
  },
  sck: {},
  tempdb: {},
};
const { sck1 } = require(__dirname + '/database/user');
const { sck } = require(__dirname + '/database/group');
const { alive } = require(__dirname + '/database/alive');
const { dbtemp } = require(__dirname + '/database/tempdb');
const { Pool } = require('pg');
let pg = {};
const fs = require('fs');
let pgtables = {
  bot_: `
    CREATE TABLE IF NOT EXISTS bot_ (
      id VARCHAR(255) UNIQUE NOT NULL DEFAULT 'Xstro_Md',
      permit BOOLEAN DEFAULT false,
      permit_values VARCHAR(255) DEFAULT '212',
      chatbot VARCHAR(255) DEFAULT 'false',
      bgm BOOLEAN DEFAULT false,
      bgmarray JSON DEFAULT '{}',
      plugins JSON DEFAULT '{}',
      notes JSON DEFAULT '{}',
      antiviewonce VARCHAR(255) DEFAULT 'true',
      antidelete VARCHAR(255) DEFAULT 'true',
      autobio VARCHAR(255) DEFAULT 'false',
      levelup VARCHAR(255) DEFAULT 'true',
      autoreaction VARCHAR(255) DEFAULT 'true',
      anticall VARCHAR(255) DEFAULT 'true',
      mention JSON DEFAULT '{}',
      filter JSON DEFAULT '{}',
      afk JSON DEFAULT '{}',
      rent JSON DEFAULT '{}'
      ${options.bot_ ? ',\n ' + options.bot_ : ''}
    );
  `,
  sck1: `
    CREATE TABLE IF NOT EXISTS sck1 (
      id VARCHAR(255) UNIQUE NOT NULL DEFAULT 'Xstro_Md',
      name VARCHAR(255) DEFAULT 'Unknown',
      times INTEGER DEFAULT 0,
      permit VARCHAR(255) DEFAULT 'false',
      ban VARCHAR(255) DEFAULT 'false',
      afk VARCHAR(255) DEFAULT 'false',
      afktime INTEGER DEFAULT 0,
      bot BOOLEAN DEFAULT false,
      msg JSON DEFAULT '{}',
      warn JSON DEFAULT '{}'
      ${options.sck1 ? ',\n ' + options.sck1 : ''}
    );
  `,
  sck: `
    CREATE TABLE IF NOT EXISTS Sck (
      id VARCHAR(255) UNIQUE NOT NULL DEFAULT 'Xstro_Md',
      events VARCHAR(255) DEFAULT 'false',
      nsfw VARCHAR(255) DEFAULT 'false',
      pdm VARCHAR(255) DEFAULT 'false',
      antipromote VARCHAR(255) DEFAULT 'false',
      antidemote VARCHAR(255) DEFAULT 'false',
      welcome VARCHAR(255) DEFAULT 'false',
      goodbye VARCHAR(255) DEFAULT 'false',
      welcometext TEXT DEFAULT '*@user @pp welcome to @gname*',
      goodbyetext TEXT DEFAULT '@user @pp left @gname',
      botenable VARCHAR(255) DEFAULT 'true',
      antilink VARCHAR(255) DEFAULT 'false',
      antiword JSON DEFAULT '{}',
      antifake VARCHAR(255) DEFAULT 'false',
      antispam VARCHAR(255) DEFAULT 'false',
      antitag VARCHAR(255) DEFAULT 'false',
      antibot VARCHAR(255) DEFAULT 'false',
      onlyadmin VARCHAR(255) DEFAULT 'false',
      economy VARCHAR(255) DEFAULT 'false',
      disablecmds VARCHAR(255) DEFAULT 'false',
      chatbot VARCHAR(255) DEFAULT 'false',
      mute VARCHAR(255) DEFAULT 'false',
      unmute VARCHAR(255) DEFAULT 'false'
      ${options.sck ? ',\n ' + options.sck : ''}
    );
  `,
  tempdb: `
    CREATE TABLE IF NOT EXISTS tempdb (
      id VARCHAR(255) UNIQUE NOT NULL DEFAULT 'Suhail-MD',
      data JSON DEFAULT '{}'
      ${options.tempdb ? ',\n ' + options.tempdb : ''}
    );
  `,
};

global.DATABASE_URL = global.DATABASE_URL || global.DATABASE_URI || process.env.DATABASE_URL;
let cacheTable = {};

pg.connnectpg = () => {
  pool = new Pool({
    connectionString: global.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  pool.on('connect', () => {
    cacheTable.connectPg = true;
    sqldb = true;
    return sqldb;
  });

  pool.on('error', (error) => {
    console.log('PostgreSQL database error:', error);
    setTimeout(pg.connnectpg, 1000);
  });
};

pg.createTable = async (tableName) => {
  if ((!sqldb && !cacheTable.connectPg) || (!pool && global.sqldb)) {
    let isConnected = pg.connnectpg();
    if (!isConnected) {
      return false;
    }
  }
  if (cacheTable[tableName]) {
    return true;
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(pgtables[tableName]);
    await client.query('COMMIT');
    if (!cacheTable[tableName]) {
      console.log(`PostgreSQL ${tableName} Table created in Database.`);
    }
    cacheTable[tableName] = true;
    return true;
  } catch (error) {
    console.log(`Error creating PostgreSQL ${tableName} Table:`, error);
  } finally {
    client.release();
  }
};

pg.new = async (tableName, rowData) => {
  if (!(await pg.createTable(tableName))) {
    return false;
  }
  const client = await pool.connect();
  try {
    if (await pg.findOne(tableName, rowData)) {
      return await pg.updateOne(tableName, { id: rowData.id }, rowData);
    }
    await client.query('BEGIN');
    const insertQuery = `
      INSERT INTO ${tableName} (${Object.keys(rowData).join(', ')})
      VALUES (${Object.keys(rowData).map((_, index) => `$${index + 1}`).join(', ')})
      ON CONFLICT (id) DO NOTHING
      RETURNING *;
    `;
    const values = Object.values(rowData);
    const result = await client.query(insertQuery, values);
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.log(`Error inserting new row into ${tableName}`, error);
  } finally {
    client.release();
  }
};

pg.countDocuments = async (tableName) => {
  if (!(await pg.createTable(tableName))) {
    return 0;
  }
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT COUNT(*) FROM ${tableName}`);
    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    return 0;
  } finally {
    client.release();
  }
};

pg.findOne = async (tableName, query) => {
  if (!(await pg.createTable(tableName))) {
    return false;
  }
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM ${tableName} WHERE id = $1`, [query.id]);
    return result.rows[0];
  } catch (error) {
    console.log(`Error while finding ${tableName} document by Id: ${query.id}`, error);
    return false;
  } finally {
    client.release();
  }
};

pg.find = async (tableName, query = {}) => {
  if (!(await pg.createTable(tableName))) {
    return [];
  }
  const client = await pool.connect();
  try {
    if (!Object.values(query).length) {
      return (await client.query(`SELECT * FROM ${tableName}`)).rows || [];
    } else if (query.id) {
      return [await pg.findOne(tableName, query)];
    }
  } catch (error) {
    console.log(`Error while finding ${tableName} documents`, error);
    return [];
  } finally {
    client.release();
  }
};

pg.updateOne = async (tableName, query, updateData = {}) => {
  if (!(await pg.createTable(tableName))) {
    return false;
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const selectQuery = `SELECT * FROM ${tableName} WHERE id = $1 FOR UPDATE`;
    const selectResult = await client.query(selectQuery, [query.id]);
    if (selectResult.rows[0]) {
      const updateQuery = `
        UPDATE ${tableName}
        SET ${Object.keys(updateData).map((key, index) => `${key} = $${index + 2}`).join(', ')}
        WHERE id = $1
        RETURNING *;
      `;
      const values = [query.id, ...Object.values(updateData)];
      const result = await client.query(updateQuery, values);
      await client.query('COMMIT');
      return result.rows[0];
    } else {
      return await pg.new(tableName, { ...query, ...updateData });
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error while updating ${tableName} document by Id: ${query.id}`, error);
    return [];
  } finally {
    client.release();
  }
};

pg.findOneAndDelete = async (tableName, query) => {
  if (!(await pg.createTable(tableName))) {
    return false;
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const selectQuery = `SELECT * FROM ${tableName} WHERE id = $1 FOR UPDATE`;
    const selectResult = await client.query(selectQuery, [query.id]);
    if (selectResult.rows[0]) {
      const deleteQuery = `DELETE FROM ${tableName} WHERE id = $1 RETURNING *`;
      const result = await client.query(deleteQuery, [query.id]);
      await client.query('COMMIT');
      return result.rows[0];
    } else {
      return true;
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error while deleting ${tableName} document by Id: ${query.id}`, error);
    return false;
  } finally {
    client.release();
  }
};

pg.collection = {
  drop: async (tableName) => {
    if (!(await pg.createTable(tableName))) {
      return false;
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`DROP TABLE IF EXISTS ${tableName}`);
      await client.query('COMMIT');
      delete cacheTable[tableName];
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error while dropping ${tableName} table`, error);
      return false;
    } finally {
      client.release();
    }
  },
};

let dbs = {
  newtables: {
    bot_: {
      id: 'Xstro_Md',
      permit: false,
      permit_values: 'all',
      chatbot: 'false',
      antiviewonce: 'true',
      antidelete: 'true',
      autobio: 'false',
      levelup: 'false',
      anticall: 'true',
      autoreaction: 'true',
      bgm: false,
      bgmarray: {},
      plugins: {},
      notes: {},
      warn: {},
      afk: {},
      filter: {},
      mention: {},
      rent: {},
      ...(optJson.bot_ || {}),
    },
    sck: {
      id: 'Xstro_Md',
      events: 'false',
      nsfw: 'false',
      pdm: 'false',
      antipromote: 'false',
      antidemote: 'false',
      welcome: 'false',
      goodbye: 'false',
      welcometext: '*@user @pp welcome to @gname*',
      goodbyetext: '*@user @pp left @gname*',
      botenable: 'true',
      antilink: 'false',
      antiword: {},
      antifake: 'false',
      antispam: 'false',
      antitag: 'false',
      antibot: 'false',
      onlyadmin: 'false',
      economy: 'false',
      disablecmds: 'false',
      chatbot: 'false',
      mute: 'false',
      unmute: 'false',
      ...(optJson.sck || {}),
    },
    sck1: {
      id: 'chatid',
      name: 'Unknown',
      times: 0,
      permit: 'false',
      ban: 'false',
      warn: {},
      ...(optJson.sck1 || {}),
    },
    tempdb: {
      id: 'chatid',
      data: {},
      ...(optJson.tempdb || {}),
    },
  },
};
dbs.loadGroupData = async _0x4c76be => {
  try {
    if (fs.existsSync(__dirname + '/' + _0x4c76be + '.json')) {
      return await JSON.parse(fs.readFileSync(__dirname + '/' + _0x4c76be + '.json', 'utf8'));
    } else {
      fs.writeFileSync(__dirname + '/' + _0x4c76be + '.json', JSON.stringify({}, null, 2), 'utf8');
      return {};
    }
  } catch (_0x508f7b) {
    console.error('Error loading user data:', _0x508f7b);
    return {};
  }
};
dbs.saveGroupData = async (_0x4e0b16, _0x17041b = {}) => {
  fs.writeFileSync(__dirname + '/' + _0x4e0b16 + '.json', JSON.stringify(_0x17041b, null, 2), 'utf8');
};
dbs.countDocuments = async _0x40e980 => {
  try {
    let _0x556576 = await dbs.loadGroupData(_0x40e980);
    let _0x5aa845 = Object.keys(_0x556576);
    return _0x5aa845.length;
  } catch (_0x26fc7b) {
    console.log('Error while countDocuments of ' + _0x40e980 + ' in database,\n', _0x26fc7b);
    return 0;
  }
};
dbs.new = async (_0x5cbecc, _0x56893f) => {
  try {
    let _0x28d31f = await dbs.loadGroupData(_0x5cbecc);
    if (!_0x28d31f[_0x56893f.id]) {
      _0x28d31f[_0x56893f.id] = {
        ...dbs.newtables[_0x5cbecc],
        ..._0x56893f,
      };
      await dbs.saveGroupData(_0x5cbecc, _0x28d31f);
      return _0x28d31f[_0x56893f.id];
    } else {
      return _0x28d31f[_0x56893f.id];
    }
  } catch (_0x2db0bb) {
    console.log('Error while Creating new ' + _0x5cbecc + ' in database,\n', _0x2db0bb);
    return {};
  }
};
dbs.findOne = async (_0x5c2c48, _0x46f9e4) => {
  try {
    let _0x553896 = await dbs.loadGroupData(_0x5c2c48);
    if (_0x553896[_0x46f9e4.id]) {
      return _0x553896[_0x46f9e4.id];
    } else {
      return;
    }
  } catch (_0x5de72c) {
    console.log('Error while findOne ' + _0x5c2c48 + ' in database,\n', _0x5de72c);
    return;
  }
};
dbs.find = async (_0x400b9f, _0x176ccb = {}) => {
  try {
    let _0x17d064 = Object.values(_0x176ccb);
    let _0x317000 = await dbs.loadGroupData(_0x400b9f);
    if (_0x317000[_0x176ccb.id]) {
      return [
        {
          ..._0x317000[_0x176ccb.id],
        },
      ];
    } else if (!_0x17d064[0]) {
      return Object.values(_0x317000);
    }
    return [];
  } catch (_0x516c73) {
    console.log('Error while finding  ' + _0x400b9f + '(s) in database,\n', _0x516c73);
    return [];
  }
};
dbs.updateOne = async (_0x2a59d7, _0x4e66f2, _0x525852 = {}) => {
  try {
    let _0x531b7d = await dbs.loadGroupData(_0x2a59d7);
    if (_0x531b7d[_0x4e66f2.id]) {
      _0x531b7d[_0x4e66f2.id] = {
        ..._0x531b7d[_0x4e66f2.id],
        ..._0x525852,
      };
      await dbs.saveGroupData(_0x2a59d7, _0x531b7d);
      return _0x531b7d[_0x4e66f2.id];
    } else {
      return await dbs.new(_0x2a59d7, {
        ..._0x4e66f2,
        ..._0x525852,
      });
    }
  } catch (_0xc2d328) {
    console.log('Error while updateOne ' + _0x2a59d7 + ' in database,\n', _0xc2d328);
    return {};
  }
};
dbs.findOneAndDelete = async (_0x1571a5, _0x38c370) => {
  try {
    let _0x4602ed = await dbs.loadGroupData(_0x1571a5);
    delete _0x4602ed[_0x38c370.id];
    await dbs.saveGroupData(_0x1571a5, _0x4602ed);
    return true;
  } catch (_0xfe5527) {
    console.log('Error while findOneAndDelete ' + _0x1571a5 + ' in database,\n', _0xfe5527);
    return null;
  }
};
dbs.delete = dbs.findOneAndDelete;
dbs.collection = {
  drop: async _0x398a10 => {
    try {
      let _0xf54519 = await dbs.loadGroupData(_0x398a10);
      Object.keys(_0xf54519).forEach(_0x2ec00a => delete _0xf54519[_0x2ec00a]);
      await dbs.saveGroupData(_0x398a10, _0xf54519);
      return true;
    } catch (_0x139201) {
      console.log('Error while collection.drop all user in database,\n', _0x139201);
      return null;
    }
  },
};
dbs.deleteAll = dbs.collection.drop;
let groupdb = {};
groupdb.countDocuments = async () => {
  try {
    if (isMongodb) {
      return await sck.countDocuments();
    } else if (sqldb && pg) {
      return await pg.countDocuments('sck');
    } else {
      return await dbs.countDocuments('sck');
    }
  } catch (_0x358805) {
    console.log('Error while Creating user in database,\n', _0x358805);
    return 0;
  }
};
groupdb.new = async _0x3cc665 => {
  try {
    if (isMongodb) {
      let _0x4d9fd9 =
        (await sck.findOne({
          id: _0x3cc665.id,
        })) ||
        (await new sck({
          id: _0x3cc665.id,
          ..._0x3cc665,
        }).save());
      return _0x4d9fd9;
    } else if (sqldb && pg) {
      var _0x37b677 =
        (await pg.findOne('sck', {
          id: _0x3cc665.id,
        })) || (await pg.new('sck', _0x3cc665));
      return _0x37b677;
    } else {
      var _0x37b677 =
        (await dbs.findOne('sck', {
          id: _0x3cc665.id,
        })) || (await dbs.new('sck', _0x3cc665));
      return _0x37b677;
    }
  } catch (_0x158b65) {
    console.log('Error while Creating user in database,\n', _0x158b65);
    return {};
  }
};
groupdb.findOne = async _0x43a8fb => {
  try {
    if (isMongodb) {
      return await sck.findOne({
        id: _0x43a8fb.id,
      });
    } else if (sqldb && pg) {
      return await pg.findOne('sck', _0x43a8fb);
    } else {
      var _0x5c6403 = await dbs.findOne('sck', {
        id: _0x43a8fb.id,
      });
      return _0x5c6403;
    }
  } catch (_0x123237) {
    console.log('Error while finding user in database,\n', _0x123237);
    return;
  }
};
groupdb.find = async _0x34af0e => {
  try {
    if (isMongodb) {
      let _0x136f48 = await sck.find(_0x34af0e);
      return _0x136f48;
    } else if (sqldb && pg) {
      return await pg.find('sck', _0x34af0e);
    } else {
      return await dbs.find('sck', _0x34af0e);
    }
  } catch (_0x1cfef2) {
    console.log('Error while finding user in database,\n', _0x1cfef2);
    return [];
  }
};
groupdb.updateOne = async (_0x41987c, _0x373559 = {}) => {
  try {
    if (!_0x41987c.id) {
      return {};
    }
    if (isMongodb) {
      return await sck.updateOne(
        {
          id: _0x41987c.id,
        },
        {
          ..._0x373559,
        }
      );
    } else if (sqldb && pg) {
      return await pg.updateOne(
        'sck',
        {
          id: _0x41987c.id,
        },
        _0x373559
      );
    } else {
      return await dbs.updateOne('sck', _0x41987c, _0x373559);
    }
  } catch (_0x596b5e) {
    console.log('Error while updateOne user in database,\n', _0x596b5e);
    return {};
  }
};
groupdb.findOneAndDelete = async _0x87c347 => {
  try {
    if (!_0x87c347.id) {
      return [];
    }
    if (isMongodb) {
      return await sck.findOneAndDelete({
        id: _0x87c347.id,
      });
    } else if (sqldb && pg) {
      return await pg.findOneAndDelete('sck', _0x87c347);
    } else {
      return await dbs.findOneAndDelete('sck', _0x87c347);
    }
  } catch (_0xc37ca6) {
    console.log('Error while findOneAndDelete user in database,\n', _0xc37ca6);
    return null;
  }
};
groupdb.delete = groupdb.findOneAndDelete;
groupdb.collection = {
  drop: async () => {
    try {
      if (isMongodb) {
        return await sck.collection.drop();
      } else if (sqldb && pg) {
        return await pg.collection.drop('sck');
      } else {
        return await dbs.collection.drop('sck');
      }
    } catch (_0x523825) {
      console.log('Error while collection.drop all user in database,\n', _0x523825);
      return null;
    }
  },
};
let userdb = {};
userdb.countDocuments = async () => {
  try {
    if (isMongodb) {
      return await sck1.countDocuments();
    } else if (sqldb && pg) {
      return await pg.countDocuments('sck1');
    } else {
      return await dbs.countDocuments('sck1');
    }
  } catch (_0xb4305) {
    console.log('Error from userdb.countDocuments() in user database,\n', _0xb4305);
    return 0;
  }
};
userdb.new = async _0x5f55f4 => {
  try {
    if (isMongodb) {
      let _0x985b9a =
        (await sck1.findOne({
          id: _0x5f55f4.id,
        })) ||
        (await new sck1({
          id: _0x5f55f4.id,
          ..._0x5f55f4,
        }).save());
      return _0x985b9a;
    } else if (sqldb && pg) {
      var _0xa591b3 =
        (await pg.findOne('sck1', {
          id: _0x5f55f4.id,
        })) || (await pg.new('sck1', _0x5f55f4));
      return _0xa591b3;
    } else {
      var _0xa591b3 =
        (await dbs.findOne('sck1', {
          id: _0x5f55f4.id,
        })) || (await dbs.new('sck1', _0x5f55f4));
      return _0xa591b3;
    }
  } catch (_0x11a429) {
    console.log('Error userdb.new() in user database,\n', _0x11a429);
    return {};
  }
};
userdb.findOne = async _0x2450d0 => {
  try {
    if (isMongodb) {
      return await sck1.findOne({
        id: _0x2450d0.id,
      });
    } else if (sqldb && pg) {
      return await pg.findOne('sck1', _0x2450d0);
    } else {
      var _0x46cfd1 = await dbs.findOne('sck1', {
        id: _0x2450d0.id,
      });
      return _0x46cfd1;
    }
  } catch (_0x5a2e19) {
    console.log('Error userdb.findOne() in user database,\n', _0x5a2e19);
    return;
  }
};
userdb.find = async _0x5b0712 => {
  try {
    if (isMongodb) {
      let _0x1e2f9e = await sck1.find(_0x5b0712);
      return _0x1e2f9e;
    } else if (sqldb && pg) {
      return await pg.find('sck1', _0x5b0712);
    } else {
      return await dbs.find('sck1', _0x5b0712);
    }
  } catch (_0x478a2a) {
    console.log('Error userdb.find() in user database,\n', _0x478a2a);
    return [];
  }
};
userdb.updateOne = async (_0x234cce, _0x2ecb25 = {}) => {
  try {
    if (!_0x234cce.id) {
      return {};
    }
    if (isMongodb) {
      return await sck1.updateOne(
        {
          id: _0x234cce.id,
        },
        {
          ..._0x2ecb25,
        }
      );
    } else if (sqldb && pg) {
      return await pg.updateOne(
        'sck1',
        {
          id: _0x234cce.id,
        },
        _0x2ecb25
      );
    } else {
      return await dbs.updateOne('sck1', _0x234cce, _0x2ecb25);
    }
  } catch (_0x5066df) {
    console.log('Error userdb.updateOne() in user database,\n', _0x5066df);
    return {};
  }
};
userdb.findOneAndDelete = async _0xdeca22 => {
  try {
    if (!_0xdeca22.id) {
      return [];
    }
    if (isMongodb) {
      return await sck1.findOneAndDelete({
        id: _0xdeca22.id,
      });
    } else if (sqldb && pg) {
      return await pg.findOneAndDelete('sck1', _0xdeca22);
    } else {
      return await dbs.findOneAndDelete('sck1', _0xdeca22);
    }
  } catch (_0x46c202) {
    console.log('Error userdb.findOneAndDelete() in user database,\n', _0x46c202);
    return null;
  }
};
userdb.delete = userdb.findOneAndDelete;
userdb.collection = {
  drop: async () => {
    try {
      if (isMongodb) {
        return await sck1.collection.drop();
      } else if (sqldb && pg) {
        return await pg.collection.drop('sck1');
      } else {
        return await dbs.collection.drop('sck1');
      }
    } catch (_0x2969c3) {
      console.log('Error userdb.collection.drop() in user database,\n', _0x2969c3);
      return null;
    }
  },
};
let alivedb = {};
alivedb.countDocuments = async () => {
  try {
    if (isMongodb) {
      return await alive.countDocuments();
    } else if (sqldb && pg) {
      return await pg.countDocuments('bot_');
    } else {
      return await dbs.countDocuments('bot_');
    }
  } catch (_0x4081dd) {
    console.log('Error while Creating user in database,\n', _0x4081dd);
    return 0;
  }
};
alivedb.new = async _0x2bee50 => {
  try {
    if (isMongodb) {
      let _0xd1aa49 =
        (await alive.findOne({
          id: _0x2bee50.id,
        })) ||
        (await new alive({
          id: _0x2bee50.id,
          ..._0x2bee50,
        }).save());
      return _0xd1aa49;
    } else if (sqldb && pg) {
      return (
        (await pg.findOne('bot_', {
          id: _0x2bee50.id,
        })) || (await pg.new('bot_', _0x2bee50))
      );
    } else {
      var _0x3c13ea =
        (await dbs.findOne('bot_', {
          id: _0x2bee50.id,
        })) || (await dbs.new('bot_', _0x2bee50));
      return _0x3c13ea;
    }
  } catch (_0x5111bd) {
    console.log('Error while Creating BOT INFO in database,\n', _0x5111bd);
    return {};
  }
};
alivedb.findOne = async _0x443ebe => {
  try {
    if (isMongodb) {
      return await alive.findOne({
        id: _0x443ebe.id,
      });
    } else if (sqldb && pg) {
      return await pg.findOne('bot_', _0x443ebe);
    } else {
      var _0x829297 = await dbs.findOne('bot_', {
        id: _0x443ebe.id,
      });
      return _0x829297;
    }
  } catch (_0x3b7a2d) {
    console.log('Error while finding user in database,\n', _0x3b7a2d);
    return;
  }
};
alivedb.find = async _0x19e70e => {
  try {
    if (isMongodb) {
      let _0x2bd607 = await alive.find(_0x19e70e);
      return _0x2bd607;
    } else if (sqldb && pg) {
      return await pg.find('bot_', _0x19e70e);
    } else {
      return await dbs.find('bot_', _0x19e70e);
    }
  } catch (_0x5d0439) {
    console.log('Error while finding user in database,\n', _0x5d0439);
    return [];
  }
};
alivedb.updateOne = async (_0x4f101f, _0xd5825b = {}) => {
  try {
    if (!_0x4f101f.id) {
      return {};
    }
    if (isMongodb) {
      return await alive.updateOne(
        {
          id: _0x4f101f.id,
        },
        {
          ..._0xd5825b,
        }
      );
    } else if (sqldb && pg) {
      return await pg.updateOne(
        'bot_',
        {
          id: _0x4f101f.id,
        },
        _0xd5825b
      );
    } else {
      return await dbs.updateOne('bot_', _0x4f101f, _0xd5825b);
    }
  } catch (_0x2bdc25) {
    console.log('Error while updateOne user in database,\n', _0x2bdc25);
    return {};
  }
};
alivedb.findOneAndDelete = async _0x660230 => {
  try {
    if (!_0x660230.id) {
      return [];
    }
    if (isMongodb) {
      return await alive.findOneAndDelete({
        id: _0x660230.id,
      });
    } else if (sqldb && pg) {
      return await pg.findOneAndDelete('bot_', _0x660230);
    } else {
      return await dbs.findOneAndDelete('bot_', _0x660230);
    }
  } catch (_0x4492eb) {
    console.log('Error while findOneAndDelete user in database,\n', _0x4492eb);
    return null;
  }
};
alivedb.delete = alivedb.findOneAndDelete;
alivedb.collection = {
  drop: async () => {
    try {
      if (isMongodb) {
        return await alive.collection.drop();
      } else if (sqldb && pg) {
        return await pg.collection.drop('bot_');
      } else {
        return await dbs.collection.drop('bot_');
      }
    } catch (_0x4e2fb0) {
      console.log('Error while collection.drop all user in database,\n', _0x4e2fb0);
      return null;
    }
  },
};
let tempdb = {};
tempdb.countDocuments = async () => {
  try {
    if (isMongodb) {
      return await dbtemp.countDocuments();
    } else if (sqldb && pg) {
      return await pg.countDocuments('tempdb');
    } else {
      return await dbs.countDocuments('tempdb');
    }
  } catch (_0x4fc8d8) {
    console.log('Error while Creating user in database,\n', _0x4fc8d8);
    return 0;
  }
};
tempdb.new = async _0x526942 => {
  try {
    if (isMongodb) {
      let _0x2fd0a9 =
        (await dbtemp.findOne({
          id: _0x526942.id,
        })) ||
        (await new dbtemp({
          id: _0x526942.id,
          ..._0x526942,
        }).save());
      return _0x2fd0a9;
    } else if (sqldb && pg) {
      var _0x2b0d8b =
        (await pg.findOne('tempdb', {
          id: _0x526942.id,
        })) || (await pg.new('tempdb', _0x526942));
      return _0x2b0d8b;
    } else {
      var _0x2b0d8b =
        (await dbs.findOne('tempdb', {
          id: _0x526942.id,
        })) || (await dbs.new('tempdb', _0x526942));
      return _0x2b0d8b;
    }
  } catch (_0x389022) {
    console.log('Error while Creating user in database,\n', _0x389022);
    return {};
  }
};
tempdb.findOne = async _0x4058b4 => {
  try {
    if (isMongodb) {
      return await dbtemp.findOne({
        id: _0x4058b4.id,
      });
    } else if (sqldb && pg) {
      return await pg.findOne('tempdb', _0x4058b4);
    } else {
      var _0x1711e3 = await dbs.findOne('tempdb', {
        id: _0x4058b4.id,
      });
      return _0x1711e3;
    }
  } catch (_0xda1823) {
    console.log('Error while finding user in database,\n', _0xda1823);
    return;
  }
};
tempdb.find = async _0x3f7c16 => {
  try {
    if (isMongodb) {
      let _0x143b7e = await dbtemp.find(_0x3f7c16);
      return _0x143b7e;
    } else if (sqldb && pg) {
      return await pg.find('tempdb', _0x3f7c16);
    } else {
      return await dbs.find('tempdb', _0x3f7c16);
    }
  } catch (_0x5a2fa5) {
    console.log('Error while finding user in database,\n', _0x5a2fa5);
    return [];
  }
};
tempdb.updateOne = async (_0x41af4e, _0x92ae4 = {}) => {
  try {
    if (!_0x41af4e.id) {
      return {};
    }
    if (isMongodb) {
      return await dbtemp.updateOne(
        {
          id: _0x41af4e.id,
        },
        {
          ..._0x92ae4,
        }
      );
    } else if (sqldb && pg) {
      return await pg.updateOne(
        'tempdb',
        {
          id: _0x41af4e.id,
        },
        _0x92ae4
      );
    } else {
      return await dbs.updateOne('tempdb', _0x41af4e, _0x92ae4);
    }
  } catch (_0xc75f88) {
    console.log('Error while updateOne user in database,\n', _0xc75f88);
    return {};
  }
};
tempdb.findOneAndDelete = async _0x339ced => {
  try {
    if (!_0x339ced.id) {
      return [];
    }
    if (isMongodb) {
      return await dbtemp.findOneAndDelete({
        id: _0x339ced.id,
      });
    } else if (sqldb && pg) {
      return await pg.findOneAndDelete('tempdb', _0x339ced);
    } else {
      return await dbs.findOneAndDelete('tempdb', _0x339ced);
    }
  } catch (_0x55d55b) {
    console.log('Error while findOneAndDelete user in database,\n', _0x55d55b);
    return null;
  }
};
tempdb.delete = tempdb.findOneAndDelete;
tempdb.collection = {
  drop: async () => {
    try {
      if (isMongodb) {
        return await dbtemp.collection.drop();
      } else if (sqldb && pg) {
        return await pg.collection.drop('tempdb');
      } else {
        return await dbs.collection.drop('tempdb');
      }
    } catch (_0x32ad2c) {
      console.log('Error while collection.drop all user in database,\n', _0x32ad2c);
      return null;
    }
  },
};
module.exports = {
  tempdb: tempdb,
  pg: pg,
  dbs: dbs,
  groupdb: groupdb,
  userdb: userdb,
  alivedb: alivedb,
  bot_: alivedb,
};
