import { lock } from './redis';

function genLock(lockMethod: 'ensureLock' | 'tryLock') {
  return function Lock(lockKey: string, expireSeconds?: number) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
      descriptor.value = async function (...args: any[]) {
        await lock[lockMethod](lockKey, expireSeconds);
        try {
          await originalMethod.apply(this, args);
        } finally {
          await lock.unLock(lockKey);
        }
      };
      return descriptor;
    };
  };
}

export const EnsureLock = genLock('ensureLock');
export const TryLock = genLock('tryLock');
