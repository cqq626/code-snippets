import * as asyncHooks from 'async_hooks';

// FIXME: 这里是否需要用uuid?
export const makeTraceID = (): string =>
  Math.random().toString(36).substring(2, 13).padEnd(11, '0');
export const makeRequestID = (): string =>
  Math.random().toString(36).substring(2, 8).padEnd(6, '0');

type AsyncState = {
  traceID: string;
  requestID?: string;
};

export type TraceInfo = {
  traceID: string;
  requestID: string;
  combine: string;
};

const store: {
  getStore(): AsyncState | undefined;
  enterWith(s: AsyncState): void;
} = new asyncHooks.AsyncLocalStorage();

const Split = '-';

export function setTraceID(traceID?: string): string {
  traceID = traceID ?? makeTraceID();
  store.enterWith({ traceID });
  return traceID;
}

export function getTraceID(): string {
  const curStore = store.getStore() ?? { traceID: '' };
  const traceID = curStore.traceID ?? '';
  if (traceID === '') {
    return setTraceID();
  }
  return traceID;
}

export function setTraceInfo(traceInfo?: AsyncState | string): string {
  let traceID, requestID;
  if (typeof traceInfo === 'string') {
    [traceID, requestID] = traceInfo.split(Split) as any;
  } else if (traceInfo != null) {
    ({ traceID, requestID } = traceInfo as any);
  }

  traceID = traceID ?? makeTraceID();
  requestID = requestID ?? makeRequestID();
  store.enterWith({ traceID, requestID });
  return `${traceID}${Split}${requestID}`;
}

export function getTraceInfo(returnType: 'combine' | 'detail' = 'combine') {
  const curStore = store.getStore() ?? { traceID: '', requestID: '' };
  let traceID = curStore.traceID ?? '';
  let requestID = curStore.requestID ?? '';
  const needSet = traceID === '' || requestID === '';
  if (traceID === '') {
    traceID = makeTraceID();
  }
  if (requestID === '') {
    requestID = makeRequestID();
  }
  if (needSet) {
    setTraceInfo({ traceID, requestID });
  }
  const combine = `${traceID}${Split}${requestID}`;
  return returnType === 'combine' ? combine : { traceID, requestID, combine };
}
