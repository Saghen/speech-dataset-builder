import { BadRequestError, NotFoundError, UnauthorizedError, UnknownError } from './errors';

export * from './errors';
export * from './logger';

export enum CodesEnum {
  Success = 'success',
  NotFound = 'not-found',
  BadRequest = 'bad-request',
  Unauthorized = 'unauthorized',
  Unknown = 'unknown',
}

export type Resolvers = Record<
  string,
  ((body: any, ctx: Context) => any) | Router<string, Record<string, any>>
>;

export type Context = {
  meta: Record<string, any>;
};

export type Router<Prefix extends string, T extends Resolvers> = {
  prefix: Prefix;
  resolvers: T;
  handleRequest: (path: string, body: any, ctx: Context) => Promise<any>;
};

export function createRouter<Prefix extends string, T extends Resolvers>(
  prefix: Prefix,
  resolvers: T,
): Router<Prefix, T> {
  return {
    prefix,
    resolvers,
    handleRequest: async (path: string, body: any, ctx: Context) => {
      const pathParts = path.split('/').filter(Boolean);
      if (!(pathParts[0] in resolvers)) throw new NotFoundError('No resource found');

      const resolver = resolvers[pathParts[0]];
      if (typeof resolver === 'function') return resolver(body, ctx);
      return resolver.handleRequest(pathParts.slice(1).join('/'), body, ctx);
    },
  };
}

export const codeToError = (code: CodesEnum, message?: string) => {
  if (code === CodesEnum.Success) throw new Error('Attempted to convert success code to error');
  if (code === CodesEnum.BadRequest) return new BadRequestError(message ?? 'Bad request');
  if (code === CodesEnum.NotFound) return new NotFoundError(message ?? 'Not found');
  if (code === CodesEnum.Unauthorized) return new UnauthorizedError(message ?? 'Unauthorized');
  return new UnknownError(message ?? 'Unknown error detected');
};

// Helpers
export type FirstParameter<Func extends (...args: any) => any> = Parameters<Func>[0];
