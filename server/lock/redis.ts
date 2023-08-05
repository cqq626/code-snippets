import Redis from 'ioredis';

class Lock {
  private client: Redis;
  private prefix = 'WM_WHATSAPP_ENRTY_SERVER_LOCK_';

  constructor(redisHost: string, redisPort: string) {
    this.client = new Redis(`redis://${redisHost}:${redisPort}`);
  }

  private async delay(millSeconds: number) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(millSeconds);
      }, millSeconds);
    });
  }

  // 保证能加上锁
  async ensureLock(key: string, expireSeconds = 10) {
    const lockKey = `${this.prefix}${key}`;
    let isLocked = true;
    while (isLocked) {
      const lockRes = await this.client.set(lockKey, 1, 'EX', expireSeconds, 'NX');
      if (lockRes === null) {
        await this.delay(100);
      } else {
        isLocked = false;
      }
    }
  }

  async unLock(key: string) {
    const lockKey = `${this.prefix}${key}`;
    await this.client.del(lockKey);
  }

  // 尝试加锁,可能加锁失败
  async tryLock(key: string, expireSeconds = 10) {
    const lockKey = `${this.prefix}${key}`;
    const lockRes = await this.client.set(lockKey, 1, 'EX', expireSeconds, 'NX');
    return lockRes === null ? false : true;
  }
}

export const lock = new Lock('127.0.0.1', '6379');
