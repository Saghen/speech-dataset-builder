import { CodesEnum } from '.';

export class UnknownError<T = any, K = any> extends Error {
  code: CodesEnum;
  constructor(message: string) {
    super(message);
    this.code = CodesEnum.Unknown;
  }
}

export class NotFoundError<T = any, K = any> extends Error {
  code: CodesEnum;
  constructor(message: string) {
    super(message);
    this.code = CodesEnum.NotFound;
  }
}

export class BadRequestError<T = any, K = any> extends Error {
  code: CodesEnum;
  constructor(message: string) {
    super(message);
    this.code = CodesEnum.BadRequest;
  }
}

export class UnauthorizedError<T = any, K = any> extends Error {
  code: CodesEnum;
  constructor(message: string) {
    super(message);
    this.code = CodesEnum.Unauthorized;
  }
}
