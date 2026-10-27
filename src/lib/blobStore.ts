/** IndexedDB 大文件存储 —— 音频等大文件不走 localStorage（容量仅 ~5MB），统一存到这里 */
const DB_NAME = 'hhqt_blobs';
const STORE = 'files';

let dbPromise: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      try {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => {
          if (!req.result.objectStoreNames.contains(STORE)) {
            req.result.createObjectStore(STORE);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error ?? new Error('IndexedDB 打开失败'));
      } catch (e) {
        reject(e);
      }
    });
  }
  return dbPromise;
}

/** 保存二进制文件（Blob），返回是否成功 */
export async function putBlob(key: string, blob: Blob): Promise<void> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(blob, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('写入失败'));
    tx.onabort = () => reject(tx.error ?? new Error('写入被中止'));
  });
}

/** 删除二进制文件 */
export async function removeBlob(key: string): Promise<void> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('删除失败'));
  });
}

/** 读取文件并生成可播放的 object URL（调用方负责在使用后释放） */
export async function getBlobUrl(key: string): Promise<string | null> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => {
      const blob = req.result as Blob | undefined;
      resolve(blob ? URL.createObjectURL(blob) : null);
    };
    req.onerror = () => reject(req.error ?? new Error('读取失败'));
  });
}
