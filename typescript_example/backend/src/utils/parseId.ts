export class HttpError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }
}

export const parseId = (param: string, name = "id"): number => {
  const parsed = parseInt(param, 10);
  if (isNaN(parsed) || parsed < 0) {
    throw new HttpError(400, `Invalid ${name}`);
  }
  return parsed;
};
