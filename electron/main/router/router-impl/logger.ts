import { CodesEnum } from '.';

const colors = {
  red: '#E06C75',
  green: '#98C379',
  yellow: '#E5C07B',
  blue: '#61AFEF',
  purple: '#C678DD',
  cyan: '#56B6C2',
  orange: '#e08d6c',
  lime: '#a9c379',
};

const colorsArr = Object.values(colors);
const getHashColor = (hash: string) =>
  colorsArr[
    Array.from(hash)
      .map((str) => str.charCodeAt(0))
      .reduce((a, b) => a + b, 0) % colorsArr.length
  ];

export const generateHash = (length = 10) =>
  Math.round(Math.random() * Number.MAX_SAFE_INTEGER)
    .toString(16)
    .slice(0, length);

// Logging
export const logRequestData = (data) => {
  if (data?.body) console.info('Body', data.body);
  if (data?.meta) console.info('Meta', data.meta);
};

export async function logRequest(
  fetchPromise: Promise<any>,
  printResponseLog: (options: ResponseLogOptions) => void,
) {
  return fetchPromise
    .then((data) => {
      printResponseLog({
        isSuccess: true,
        logInfo: () => {
          logRequestData(data);
        },
      });
      return data;
    })
    .catch((err) => {
      printResponseLog({
        isSuccess: false,
        code: err.code,
        logInfo: () => {
          if (err?.message) console.error(err.message);
          else console.error(err);
        },
      });
      throw err;
    });
}

type RequestLogOptions = {
  hash: string;
  label: string;
  labelCSS: string;
  path: string;
  logInfo?: () => void;
};
type ResponseLogOptions = {
  isSuccess: boolean;
  code?: CodesEnum;
  logInfo?: () => void;
};
export function createRequestLog({
  hash,
  label,
  labelCSS,
  path,
  logInfo,
}: RequestLogOptions): (options: ResponseLogOptions) => void {
  const startTime = performance.now();
  // Disable logging in production
  if (process.env.NODE_ENV === 'production') return () => {};

  const hashColor = getHashColor(hash);
  const reqText = `%c${label}: %c${hash}%c -> ${path}`;

  console.groupCollapsed(reqText, labelCSS, `color: ${hashColor}`, 'color: currentColor');
  if (typeof logInfo === 'function') logInfo();
  console.groupEnd();

  return ({ isSuccess, code, logInfo }: ResponseLogOptions) => {
    const totalTime = (performance.now() - startTime).toFixed(1);
    if (!isSuccess) {
      const resText = `%c${label}: %c${hash}%c !!! ${
        code ? code.split('-').join(' ').toUpperCase() : 'FAILED'
      } %c${path} %c${totalTime}ms`;
      console.groupCollapsed(
        resText,
        labelCSS,
        `color: ${hashColor}`,
        'color: #E06C75',
        'color: currentColor',
        'font-weight: normal',
      );
      if (typeof logInfo === 'function') logInfo();
      console.groupEnd();
      return;
    }

    const resText = `%c${label}: %c${hash}%c <- ${path} %c${totalTime}ms`;
    console.groupCollapsed(
      resText,
      labelCSS,
      `color: ${hashColor}`,
      'color: currentColor',
      'font-weight: normal',
    );
    if (typeof logInfo === 'function') logInfo();
    console.groupEnd();
  };
}
