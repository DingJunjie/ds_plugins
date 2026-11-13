import { existsSync, promises as fs } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const MAX_BACKUP_BYTES = 8 * 1024 * 1024;
const BACKUP_ID = /^me-[A-Za-z0-9][A-Za-z0-9-]{0,180}\.json$/;
const CLOUD_NOTE = '已写入本地坚果云同步目录；云端上传状态请以坚果云客户端为准。';
function error(message, code) { const e = new Error(message); e.code = code; return e; }

export function defaultNutstoreDirectory() {
  const override = process.env.DSH_ME_NUTSTORE_DIR?.trim();
  if (override) return path.resolve(override);
  const candidates = [
    path.join(homedir(), 'Nutstore Files', 'Nutstore'),
    path.join(homedir(), 'Nutstore Files'),
    path.join(homedir(), '我的坚果云')
  ];
  const base = candidates.find(candidate => existsSync(candidate));
  return base ? path.join(base, 'DeepSeekHarness', 'Me', 'backups') : null;
}

function summary(data) {
  if (typeof data !== 'string' || Buffer.byteLength(data, 'utf8') > MAX_BACKUP_BYTES) throw error('备份为空或超过 8 MiB 限制', 'BACKUP_INVALID');
  let value;
  try { value = JSON.parse(data); } catch { throw error('备份不是有效 JSON', 'BACKUP_INVALID'); }
  if (!value || typeof value !== 'object' || Array.isArray(value) || value.version !== 1 || !Number.isSafeInteger(value.revision) || value.revision < 0 || !Array.isArray(value.records) || !Array.isArray(value.profiles) || (value.dailyItems !== undefined && !Array.isArray(value.dailyItems)) || (value.reviews !== undefined && !Array.isArray(value.reviews))) throw error('不是 Me v1 完整备份', 'BACKUP_INVALID');
  return { version: 1, revision: value.revision, records: value.records.length, profiles: value.profiles.length, dailyItems: value.dailyItems?.length || 0, reviews: value.reviews?.length || 0 };
}

export class NutstoreBackups {
  constructor({ directory = defaultNutstoreDirectory() } = {}) {
    this.directory = directory ? path.resolve(directory) : null;
  }
  _directory() {
    if (!this.directory) throw error('未检测到坚果云同步目录。请先启动坚果云，或设置 DSH_ME_NUTSTORE_DIR。', 'NUTSTORE_NOT_FOUND');
    return this.directory;
  }
  _file(id) {
    if (typeof id !== 'string' || !BACKUP_ID.test(id)) throw error('无效备份文件标识', 'BACKUP_INVALID');
    const directory = this._directory();
    const filePath = path.resolve(directory, id);
    if (path.dirname(filePath) !== directory) throw error('备份路径越界', 'BACKUP_INVALID');
    return filePath;
  }
  async backup(data) {
    const info = summary(data);
    const directory = this._directory();
    await fs.mkdir(directory, { recursive: true, mode: 0o700 });
    const dirStat = await fs.lstat(directory);
    if (!dirStat.isDirectory() || dirStat.isSymbolicLink()) throw error('坚果云备份目标不是安全目录', 'NUTSTORE_UNSAFE');
    const id = `me-${new Date().toISOString().replace(/[:.]/g, '-')}-r${info.revision}-${randomUUID()}.json`;
    const filePath = this._file(id);
    const temp = path.join(directory, `.${randomUUID()}.tmp`);
    let handle;
    try {
      handle = await fs.open(temp, 'wx', 0o600);
      await handle.writeFile(data, 'utf8');
      await handle.sync();
      await handle.close(); handle = null;
      await fs.rename(temp, filePath);
      const dir = await fs.open(directory, 'r');
      try { await dir.sync(); } finally { await dir.close(); }
    } finally {
      if (handle) await handle.close();
      await fs.unlink(temp).catch(e => { if (e.code !== 'ENOENT') throw e; });
    }
    return { id, filePath, ...info, bytes: Buffer.byteLength(data, 'utf8'), note: CLOUD_NOTE };
  }
  async list({ limit = 50 } = {}) {
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) throw error('备份列表数量无效', 'VALIDATION_ERROR');
    const directory = this._directory();
    let entries;
    try { entries = await fs.readdir(directory, { withFileTypes: true }); }
    catch (e) { if (e.code === 'ENOENT') return { directory, backups: [], note: CLOUD_NOTE }; throw e; }
    const names = entries.filter(entry => entry.isFile() && BACKUP_ID.test(entry.name)).map(entry => entry.name).sort().reverse().slice(0, limit);
    const backups = [];
    for (const id of names) {
      const filePath = this._file(id);
      try {
        const stat = await fs.lstat(filePath);
        if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_BACKUP_BYTES) throw error('备份文件不安全或过大', 'NUTSTORE_UNSAFE');
        const data = await fs.readFile(filePath, 'utf8');
        backups.push({ id, modifiedAt: stat.mtime.toISOString(), bytes: stat.size, ...summary(data) });
      } catch (e) {
        backups.push({ id, error: e.message || '备份无法读取' });
      }
    }
    return { directory, backups, note: CLOUD_NOTE };
  }
  async read({ id } = {}) {
    const filePath = this._file(id);
    const stat = await fs.lstat(filePath);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_BACKUP_BYTES) throw error('备份文件不安全或超过大小限制', 'NUTSTORE_UNSAFE');
    const data = await fs.readFile(filePath, 'utf8');
    return { id, filePath, data, ...summary(data) };
  }
}

export { CLOUD_NOTE };
