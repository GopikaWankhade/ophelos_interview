/**
 * Client
 **/

import * as runtime from "./runtime/library.js";
import $Types = runtime.Types; // general types
import $Public = runtime.Types.Public;
import $Utils = runtime.Types.Utils;
import $Extensions = runtime.Types.Extensions;
import $Result = runtime.Types.Result;

export type PrismaPromise<T> = $Public.PrismaPromise<T>;

/**
 * Model User
 *
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>;
/**
 * Model Statement
 *
 */
export type Statement = $Result.DefaultSelection<Prisma.$StatementPayload>;
/**
 * Model Transaction
 *
 */
export type Transaction = $Result.DefaultSelection<Prisma.$TransactionPayload>;

/**
 * Enums
 */
export namespace $Enums {
  export const TransactionType: {
    Income: "Income";
    Expenditure: "Expenditure";
  };

  export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];
}

export type TransactionType = $Enums.TransactionType;

export const TransactionType: typeof $Enums.TransactionType;

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = "log" extends keyof ClientOptions
    ? ClientOptions["log"] extends Array<Prisma.LogLevel | Prisma.LogDefinition>
      ? Prisma.GetEvents<ClientOptions["log"]>
      : never
    : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>["other"] };

  /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(
    eventType: V,
    callback: (event: V extends "query" ? Prisma.QueryEvent : Prisma.LogEvent) => void,
  ): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void;

  /**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(
    arg: [...P],
    options?: { isolationLevel?: Prisma.TransactionIsolationLevel },
  ): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;

  $transaction<R>(
    fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    },
  ): $Utils.JsPromise<R>;

  $extends: $Extensions.ExtendsHook<
    "extends",
    Prisma.TypeMapCb<ClientOptions>,
    ExtArgs,
    $Utils.Call<
      Prisma.TypeMapCb<ClientOptions>,
      {
        extArgs: ExtArgs;
      }
    >
  >;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.statement`: Exposes CRUD operations for the **Statement** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Statements
   * const statements = await prisma.statement.findMany()
   * ```
   */
  get statement(): Prisma.StatementDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.transaction`: Exposes CRUD operations for the **Transaction** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Transactions
   * const transactions = await prisma.transaction.findMany()
   * ```
   */
  get transaction(): Prisma.TransactionDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF;

  export type PrismaPromise<T> = $Public.PrismaPromise<T>;

  /**
   * Validator
   */
  export import validator = runtime.Public.validator;

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError;
  export import PrismaClientValidationError = runtime.PrismaClientValidationError;

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag;
  export import empty = runtime.empty;
  export import join = runtime.join;
  export import raw = runtime.raw;
  export import Sql = runtime.Sql;

  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal;

  export type DecimalJsLike = runtime.DecimalJsLike;

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics;
  export type Metric<T> = runtime.Metric<T>;
  export type MetricHistogram = runtime.MetricHistogram;
  export type MetricHistogramBucket = runtime.MetricHistogramBucket;

  /**
   * Extensions
   */
  export import Extension = $Extensions.UserArgs;
  export import getExtensionContext = runtime.Extensions.getExtensionContext;
  export import Args = $Public.Args;
  export import Payload = $Public.Payload;
  export import Result = $Public.Result;
  export import Exact = $Public.Exact;

  /**
   * Prisma Client JS version: 6.6.0
   * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
   */
  export type PrismaVersion = {
    client: string;
  };

  export const prismaVersion: PrismaVersion;

  /**
   * Utility Types
   */

  export import JsonObject = runtime.JsonObject;
  export import JsonArray = runtime.JsonArray;
  export import JsonValue = runtime.JsonValue;
  export import InputJsonObject = runtime.InputJsonObject;
  export import InputJsonArray = runtime.InputJsonArray;
  export import InputJsonValue = runtime.InputJsonValue;

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
     * Type of `Prisma.DbNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class DbNull {
      private DbNull: never;
      private constructor();
    }

    /**
     * Type of `Prisma.JsonNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class JsonNull {
      private JsonNull: never;
      private constructor();
    }

    /**
     * Type of `Prisma.AnyNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class AnyNull {
      private AnyNull: never;
      private constructor();
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull;

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull;

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull;

  type SelectAndInclude = {
    select: any;
    include: any;
  };

  type SelectAndOmit = {
    select: any;
    omit: any;
  };

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<
    ReturnType<T>
  >;

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
  };

  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K;
  }[keyof T];

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K;
  };

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>;

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & (T extends SelectAndInclude
    ? "Please either choose `select` or `include`."
    : T extends SelectAndOmit
      ? "Please either choose `select` or `omit`."
      : {});

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & K;

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> = T extends object
    ? U extends object
      ? (Without<T, U> & U) | (Without<U, T> & T)
      : U
    : T;

  /**
   * Is T a Record?
   */
  type IsObject<T extends any> =
    T extends Array<any>
      ? False
      : T extends Date
        ? False
        : T extends Uint8Array
          ? False
          : T extends BigInt
            ? False
            : T extends object
              ? True
              : False;

  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O>; // With K possibilities
    }[K];

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>;

  type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
  }[strict];

  type Either<O extends object, K extends Key, strict extends Boolean = 1> = O extends unknown
    ? _Either<O, K, strict>
    : never;

  export type Union = any;

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
  } & {};

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (U extends unknown ? (k: U) => void : never) extends (
    k: infer I,
  ) => void
    ? I
    : never;

  export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<
    Overwrite<
      U,
      {
        [K in keyof U]-?: At<U, K>;
      }
    >
  >;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function
    ? A
    : {
        [K in keyof A]: A[K];
      } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
      ?
          | (K extends keyof O ? { [P in K]: O[P] } & O : O)
          | ({ [P in keyof O as P extends K ? P : never]-?: O[P] } & O)
      : never
  >;

  type _Strict<U, _U = U> = U extends unknown
    ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>>
    : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False;

  // /**
  // 1
  // */
  export type True = 1;

  /**
  0
  */
  export type False = 0;

  export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
  }[B];

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
      ? 1
      : 0;

  export type Has<U extends Union, U1 extends Union> = Not<Extends<Exclude<U1, U>, U1>>;

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0;
      1: 1;
    };
    1: {
      0: 1;
      1: 1;
    };
  }[B1][B2];

  export type Keys<U extends Union> = U extends unknown ? keyof U : never;

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;

  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object
    ? {
        [P in keyof T]: P extends keyof O ? O[P] : never;
      }
    : never;

  type FieldPaths<T, U = Omit<T, "_avg" | "_sum" | "_count" | "_min" | "_max">> =
    IsObject<T> extends True ? U : T;

  type GetHavingFields<T> = {
    [K in keyof T]: Or<Or<Extends<"OR", K>, Extends<"AND", K>>, Extends<"NOT", K>> extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
        ? never
        : K;
  }[keyof T];

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<
    T,
    MaybeTupleToUnion<K>
  >;

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T;

  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;

  type FieldRefInputType<Model, FieldType> = Model extends never
    ? never
    : FieldRef<Model, FieldType>;

  export const ModelName: {
    User: "User";
    Statement: "Statement";
    Transaction: "Transaction";
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName];

  export type Datasources = {
    db?: Datasource;
  };

  interface TypeMapCb<ClientOptions = {}>
    extends $Utils.Fn<{ extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<
      this["params"]["extArgs"],
      ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}
    >;
  }

  export type TypeMap<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > = {
    globalOmitOptions: {
      omit: GlobalOmitOptions;
    };
    meta: {
      modelProps: "user" | "statement" | "transaction";
      txIsolationLevel: Prisma.TransactionIsolationLevel;
    };
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>;
        fields: Prisma.UserFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[];
          };
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[];
          };
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[];
          };
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$UserPayload>;
          };
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateUser>;
          };
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>;
            result: $Utils.Optional<UserGroupByOutputType>[];
          };
          count: {
            args: Prisma.UserCountArgs<ExtArgs>;
            result: $Utils.Optional<UserCountAggregateOutputType> | number;
          };
        };
      };
      Statement: {
        payload: Prisma.$StatementPayload<ExtArgs>;
        fields: Prisma.StatementFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.StatementFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$StatementPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.StatementFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$StatementPayload>;
          };
          findFirst: {
            args: Prisma.StatementFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$StatementPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.StatementFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$StatementPayload>;
          };
          findMany: {
            args: Prisma.StatementFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$StatementPayload>[];
          };
          create: {
            args: Prisma.StatementCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$StatementPayload>;
          };
          createMany: {
            args: Prisma.StatementCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.StatementCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$StatementPayload>[];
          };
          delete: {
            args: Prisma.StatementDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$StatementPayload>;
          };
          update: {
            args: Prisma.StatementUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$StatementPayload>;
          };
          deleteMany: {
            args: Prisma.StatementDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.StatementUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.StatementUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$StatementPayload>[];
          };
          upsert: {
            args: Prisma.StatementUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$StatementPayload>;
          };
          aggregate: {
            args: Prisma.StatementAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateStatement>;
          };
          groupBy: {
            args: Prisma.StatementGroupByArgs<ExtArgs>;
            result: $Utils.Optional<StatementGroupByOutputType>[];
          };
          count: {
            args: Prisma.StatementCountArgs<ExtArgs>;
            result: $Utils.Optional<StatementCountAggregateOutputType> | number;
          };
        };
      };
      Transaction: {
        payload: Prisma.$TransactionPayload<ExtArgs>;
        fields: Prisma.TransactionFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.TransactionFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.TransactionFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>;
          };
          findFirst: {
            args: Prisma.TransactionFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.TransactionFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>;
          };
          findMany: {
            args: Prisma.TransactionFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[];
          };
          create: {
            args: Prisma.TransactionCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>;
          };
          createMany: {
            args: Prisma.TransactionCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.TransactionCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[];
          };
          delete: {
            args: Prisma.TransactionDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>;
          };
          update: {
            args: Prisma.TransactionUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>;
          };
          deleteMany: {
            args: Prisma.TransactionDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.TransactionUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.TransactionUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[];
          };
          upsert: {
            args: Prisma.TransactionUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>;
          };
          aggregate: {
            args: Prisma.TransactionAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateTransaction>;
          };
          groupBy: {
            args: Prisma.TransactionGroupByArgs<ExtArgs>;
            result: $Utils.Optional<TransactionGroupByOutputType>[];
          };
          count: {
            args: Prisma.TransactionCountArgs<ExtArgs>;
            result: $Utils.Optional<TransactionCountAggregateOutputType> | number;
          };
        };
      };
    };
  } & {
    other: {
      payload: any;
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
      };
    };
  };
  export const defineExtension: $Extensions.ExtendsHook<
    "define",
    Prisma.TypeMapCb,
    $Extensions.DefaultArgs
  >;
  export type DefaultPrismaClient = PrismaClient;
  export type ErrorFormat = "pretty" | "colorless" | "minimal";
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources;
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string;
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat;
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     *
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[];
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    };
    /**
     * Global configuration for omitting model fields by default.
     *
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig;
  }
  export type GlobalOmitConfig = {
    user?: UserOmit;
    statement?: StatementOmit;
    transaction?: TransactionOmit;
  };

  /* Types for Logging */
  export type LogLevel = "info" | "query" | "warn" | "error";
  export type LogDefinition = {
    level: LogLevel;
    emit: "stdout" | "event";
  };

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition
    ? T["emit"] extends "event"
      ? T["level"]
      : never
    : never;
  export type GetEvents<T extends any> =
    T extends Array<LogLevel | LogDefinition>
      ? GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
      : never;

  export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
  };

  export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
  };
  /* End Types for Logging */

  export type PrismaAction =
    | "findUnique"
    | "findUniqueOrThrow"
    | "findMany"
    | "findFirst"
    | "findFirstOrThrow"
    | "create"
    | "createMany"
    | "createManyAndReturn"
    | "update"
    | "updateMany"
    | "updateManyAndReturn"
    | "upsert"
    | "delete"
    | "deleteMany"
    | "executeRaw"
    | "queryRaw"
    | "aggregate"
    | "count"
    | "runCommandRaw"
    | "findRaw"
    | "groupBy";

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName;
    action: PrismaAction;
    args: any;
    dataPath: string[];
    runInTransaction: boolean;
  };

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>;

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>;

  export type Datasource = {
    url?: string;
  };

  /**
   * Count Types
   */

  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    statements: number;
  };

  export type UserCountOutputTypeSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    statements?: boolean | UserCountOutputTypeCountStatementsArgs;
  };

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountStatementsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: StatementWhereInput;
  };

  /**
   * Count Type StatementCountOutputType
   */

  export type StatementCountOutputType = {
    transactions: number;
  };

  export type StatementCountOutputTypeSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    transactions?: boolean | StatementCountOutputTypeCountTransactionsArgs;
  };

  // Custom InputTypes
  /**
   * StatementCountOutputType without action
   */
  export type StatementCountOutputTypeDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the StatementCountOutputType
     */
    select?: StatementCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * StatementCountOutputType without action
   */
  export type StatementCountOutputTypeCountTransactionsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: TransactionWhereInput;
  };

  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null;
    _avg: UserAvgAggregateOutputType | null;
    _sum: UserSumAggregateOutputType | null;
    _min: UserMinAggregateOutputType | null;
    _max: UserMaxAggregateOutputType | null;
  };

  export type UserAvgAggregateOutputType = {
    id: number | null;
  };

  export type UserSumAggregateOutputType = {
    id: number | null;
  };

  export type UserMinAggregateOutputType = {
    id: number | null;
    createdAt: Date | null;
    email: string | null;
    name: string | null;
    password: string | null;
  };

  export type UserMaxAggregateOutputType = {
    id: number | null;
    createdAt: Date | null;
    email: string | null;
    name: string | null;
    password: string | null;
  };

  export type UserCountAggregateOutputType = {
    id: number;
    createdAt: number;
    email: number;
    name: number;
    password: number;
    _all: number;
  };

  export type UserAvgAggregateInputType = {
    id?: true;
  };

  export type UserSumAggregateInputType = {
    id?: true;
  };

  export type UserMinAggregateInputType = {
    id?: true;
    createdAt?: true;
    email?: true;
    name?: true;
    password?: true;
  };

  export type UserMaxAggregateInputType = {
    id?: true;
    createdAt?: true;
    email?: true;
    name?: true;
    password?: true;
  };

  export type UserCountAggregateInputType = {
    id?: true;
    createdAt?: true;
    email?: true;
    name?: true;
    password?: true;
    _all?: true;
  };

  export type UserAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Users
     **/
    _count?: true | UserCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: UserAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: UserSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: UserMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: UserMaxAggregateInputType;
  };

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
    [P in keyof T & keyof AggregateUser]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>;
  };

  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      where?: UserWhereInput;
      orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[];
      by: UserScalarFieldEnum[] | UserScalarFieldEnum;
      having?: UserScalarWhereWithAggregatesInput;
      take?: number;
      skip?: number;
      _count?: UserCountAggregateInputType | true;
      _avg?: UserAvgAggregateInputType;
      _sum?: UserSumAggregateInputType;
      _min?: UserMinAggregateInputType;
      _max?: UserMaxAggregateInputType;
    };

  export type UserGroupByOutputType = {
    id: number;
    createdAt: Date;
    email: string;
    name: string;
    password: string;
    _count: UserCountAggregateOutputType | null;
    _avg: UserAvgAggregateOutputType | null;
    _sum: UserSumAggregateOutputType | null;
    _min: UserMinAggregateOutputType | null;
    _max: UserMaxAggregateOutputType | null;
  };

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T["by"]> & {
        [P in keyof T & keyof UserGroupByOutputType]: P extends "_count"
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], UserGroupByOutputType[P]>
          : GetScalarType<T[P], UserGroupByOutputType[P]>;
      }
    >
  >;

  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        createdAt?: boolean;
        email?: boolean;
        name?: boolean;
        password?: boolean;
        statements?: boolean | User$statementsArgs<ExtArgs>;
        _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>;
      },
      ExtArgs["result"]["user"]
    >;

  export type UserSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      createdAt?: boolean;
      email?: boolean;
      name?: boolean;
      password?: boolean;
    },
    ExtArgs["result"]["user"]
  >;

  export type UserSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      createdAt?: boolean;
      email?: boolean;
      name?: boolean;
      password?: boolean;
    },
    ExtArgs["result"]["user"]
  >;

  export type UserSelectScalar = {
    id?: boolean;
    createdAt?: boolean;
    email?: boolean;
    name?: boolean;
    password?: boolean;
  };

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetOmit<
      "id" | "createdAt" | "email" | "name" | "password",
      ExtArgs["result"]["user"]
    >;
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    statements?: boolean | User$statementsArgs<ExtArgs>;
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>;
  };
  export type UserIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {};
  export type UserIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {};

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User";
    objects: {
      statements: Prisma.$StatementPayload<ExtArgs>[];
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: number;
        createdAt: Date;
        email: string;
        name: string;
        password: string;
      },
      ExtArgs["result"]["user"]
    >;
    composites: {};
  };

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<
    Prisma.$UserPayload,
    S
  >;

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = Omit<
    UserFindManyArgs,
    "select" | "include" | "distinct" | "omit"
  > & {
    select?: UserCountAggregateInputType | true;
  };

  export interface UserDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>["model"]["User"]; meta: { name: "User" } };
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(
      args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(
      args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(
      args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(
      args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     *
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     *
     */
    findMany<T extends UserFindManyArgs>(
      args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>
    >;

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     *
     */
    create<T extends UserCreateArgs>(
      args: SelectSubset<T, UserCreateArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends UserCreateManyArgs>(
      args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(
      args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>
    >;

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     *
     */
    delete<T extends UserDeleteArgs>(
      args: SelectSubset<T, UserDeleteArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends UserUpdateArgs>(
      args: SelectSubset<T, UserUpdateArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends UserDeleteManyArgs>(
      args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends UserUpdateManyArgs>(
      args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(
      args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>
    >;

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(
      args: SelectSubset<T, UserUpsertArgs<ExtArgs>>,
    ): Prisma__UserClient<
      $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
     **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], UserCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends UserAggregateArgs>(
      args: Subset<T, UserAggregateArgs>,
    ): Prisma.PrismaPromise<GetUserAggregateType<T>>;

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<Extends<"skip", Keys<T>>, Extends<"take", Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs["orderBy"] }
        : { orderBy?: UserGroupByArgs["orderBy"] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T["orderBy"]>>>,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T["by"] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, "Field ", P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors,
    ): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the User model
     */
    readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    statements<T extends User$statementsArgs<ExtArgs> = {}>(
      args?: Subset<T, User$statementsArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$StatementPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", "Int">;
    readonly createdAt: FieldRef<"User", "DateTime">;
    readonly email: FieldRef<"User", "String">;
    readonly name: FieldRef<"User", "String">;
    readonly password: FieldRef<"User", "String">;
  }

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
  };

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Users from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Users.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
  };

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the User
       */
      select?: UserSelect<ExtArgs> | null;
      /**
       * Omit specific fields from the User
       */
      omit?: UserOmit<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: UserInclude<ExtArgs> | null;
      /**
       * Filter, which Users to fetch.
       */
      where?: UserWhereInput;
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
       *
       * Determine the order of Users to fetch.
       */
      orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
       *
       * Sets the position for listing Users.
       */
      cursor?: UserWhereUniqueInput;
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
       *
       * Take `±n` Users from the position of the cursor.
       */
      take?: number;
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
       *
       * Skip the first `n` Users.
       */
      skip?: number;
      distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
    };

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>;
  };

  /**
   * User createMany
   */
  export type UserCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>;
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>;
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput;
    /**
     * Limit how many Users to update.
     */
    limit?: number;
  };

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>;
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput;
    /**
     * Limit how many Users to update.
     */
    limit?: number;
  };

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput;
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>;
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>;
  };

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null;
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput;
  };

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput;
    /**
     * Limit how many Users to delete.
     */
    limit?: number;
  };

  /**
   * User.statements
   */
  export type User$statementsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Statement
     */
    select?: StatementSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Statement
     */
    omit?: StatementOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatementInclude<ExtArgs> | null;
    where?: StatementWhereInput;
    orderBy?: StatementOrderByWithRelationInput | StatementOrderByWithRelationInput[];
    cursor?: StatementWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: StatementScalarFieldEnum | StatementScalarFieldEnum[];
  };

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the User
       */
      select?: UserSelect<ExtArgs> | null;
      /**
       * Omit specific fields from the User
       */
      omit?: UserOmit<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: UserInclude<ExtArgs> | null;
    };

  /**
   * Model Statement
   */

  export type AggregateStatement = {
    _count: StatementCountAggregateOutputType | null;
    _avg: StatementAvgAggregateOutputType | null;
    _sum: StatementSumAggregateOutputType | null;
    _min: StatementMinAggregateOutputType | null;
    _max: StatementMaxAggregateOutputType | null;
  };

  export type StatementAvgAggregateOutputType = {
    id: number | null;
    userId: number | null;
  };

  export type StatementSumAggregateOutputType = {
    id: number | null;
    userId: number | null;
  };

  export type StatementMinAggregateOutputType = {
    id: number | null;
    createdAt: Date | null;
    name: string | null;
    userId: number | null;
  };

  export type StatementMaxAggregateOutputType = {
    id: number | null;
    createdAt: Date | null;
    name: string | null;
    userId: number | null;
  };

  export type StatementCountAggregateOutputType = {
    id: number;
    createdAt: number;
    name: number;
    userId: number;
    _all: number;
  };

  export type StatementAvgAggregateInputType = {
    id?: true;
    userId?: true;
  };

  export type StatementSumAggregateInputType = {
    id?: true;
    userId?: true;
  };

  export type StatementMinAggregateInputType = {
    id?: true;
    createdAt?: true;
    name?: true;
    userId?: true;
  };

  export type StatementMaxAggregateInputType = {
    id?: true;
    createdAt?: true;
    name?: true;
    userId?: true;
  };

  export type StatementCountAggregateInputType = {
    id?: true;
    createdAt?: true;
    name?: true;
    userId?: true;
    _all?: true;
  };

  export type StatementAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Statement to aggregate.
     */
    where?: StatementWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Statements to fetch.
     */
    orderBy?: StatementOrderByWithRelationInput | StatementOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: StatementWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Statements from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Statements.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Statements
     **/
    _count?: true | StatementCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: StatementAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: StatementSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: StatementMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: StatementMaxAggregateInputType;
  };

  export type GetStatementAggregateType<T extends StatementAggregateArgs> = {
    [P in keyof T & keyof AggregateStatement]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStatement[P]>
      : GetScalarType<T[P], AggregateStatement[P]>;
  };

  export type StatementGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: StatementWhereInput;
    orderBy?: StatementOrderByWithAggregationInput | StatementOrderByWithAggregationInput[];
    by: StatementScalarFieldEnum[] | StatementScalarFieldEnum;
    having?: StatementScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: StatementCountAggregateInputType | true;
    _avg?: StatementAvgAggregateInputType;
    _sum?: StatementSumAggregateInputType;
    _min?: StatementMinAggregateInputType;
    _max?: StatementMaxAggregateInputType;
  };

  export type StatementGroupByOutputType = {
    id: number;
    createdAt: Date;
    name: string;
    userId: number;
    _count: StatementCountAggregateOutputType | null;
    _avg: StatementAvgAggregateOutputType | null;
    _sum: StatementSumAggregateOutputType | null;
    _min: StatementMinAggregateOutputType | null;
    _max: StatementMaxAggregateOutputType | null;
  };

  type GetStatementGroupByPayload<T extends StatementGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StatementGroupByOutputType, T["by"]> & {
        [P in keyof T & keyof StatementGroupByOutputType]: P extends "_count"
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], StatementGroupByOutputType[P]>
          : GetScalarType<T[P], StatementGroupByOutputType[P]>;
      }
    >
  >;

  export type StatementSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        createdAt?: boolean;
        name?: boolean;
        userId?: boolean;
        user?: boolean | UserDefaultArgs<ExtArgs>;
        transactions?: boolean | Statement$transactionsArgs<ExtArgs>;
        _count?: boolean | StatementCountOutputTypeDefaultArgs<ExtArgs>;
      },
      ExtArgs["result"]["statement"]
    >;

  export type StatementSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      createdAt?: boolean;
      name?: boolean;
      userId?: boolean;
      user?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["statement"]
  >;

  export type StatementSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      createdAt?: boolean;
      name?: boolean;
      userId?: boolean;
      user?: boolean | UserDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["statement"]
  >;

  export type StatementSelectScalar = {
    id?: boolean;
    createdAt?: boolean;
    name?: boolean;
    userId?: boolean;
  };

  export type StatementOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetOmit<"id" | "createdAt" | "name" | "userId", ExtArgs["result"]["statement"]>;
  export type StatementInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      user?: boolean | UserDefaultArgs<ExtArgs>;
      transactions?: boolean | Statement$transactionsArgs<ExtArgs>;
      _count?: boolean | StatementCountOutputTypeDefaultArgs<ExtArgs>;
    };
  export type StatementIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };
  export type StatementIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    user?: boolean | UserDefaultArgs<ExtArgs>;
  };

  export type $StatementPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: "Statement";
    objects: {
      user: Prisma.$UserPayload<ExtArgs>;
      transactions: Prisma.$TransactionPayload<ExtArgs>[];
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: number;
        createdAt: Date;
        name: string;
        userId: number;
      },
      ExtArgs["result"]["statement"]
    >;
    composites: {};
  };

  type StatementGetPayload<S extends boolean | null | undefined | StatementDefaultArgs> =
    $Result.GetResult<Prisma.$StatementPayload, S>;

  type StatementCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<StatementFindManyArgs, "select" | "include" | "distinct" | "omit"> & {
      select?: StatementCountAggregateInputType | true;
    };

  export interface StatementDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>["model"]["Statement"];
      meta: { name: "Statement" };
    };
    /**
     * Find zero or one Statement that matches the filter.
     * @param {StatementFindUniqueArgs} args - Arguments to find a Statement
     * @example
     * // Get one Statement
     * const statement = await prisma.statement.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StatementFindUniqueArgs>(
      args: SelectSubset<T, StatementFindUniqueArgs<ExtArgs>>,
    ): Prisma__StatementClient<
      $Result.GetResult<
        Prisma.$StatementPayload<ExtArgs>,
        T,
        "findUnique",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one Statement that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {StatementFindUniqueOrThrowArgs} args - Arguments to find a Statement
     * @example
     * // Get one Statement
     * const statement = await prisma.statement.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StatementFindUniqueOrThrowArgs>(
      args: SelectSubset<T, StatementFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__StatementClient<
      $Result.GetResult<
        Prisma.$StatementPayload<ExtArgs>,
        T,
        "findUniqueOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Statement that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StatementFindFirstArgs} args - Arguments to find a Statement
     * @example
     * // Get one Statement
     * const statement = await prisma.statement.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StatementFindFirstArgs>(
      args?: SelectSubset<T, StatementFindFirstArgs<ExtArgs>>,
    ): Prisma__StatementClient<
      $Result.GetResult<
        Prisma.$StatementPayload<ExtArgs>,
        T,
        "findFirst",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Statement that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StatementFindFirstOrThrowArgs} args - Arguments to find a Statement
     * @example
     * // Get one Statement
     * const statement = await prisma.statement.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StatementFindFirstOrThrowArgs>(
      args?: SelectSubset<T, StatementFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__StatementClient<
      $Result.GetResult<
        Prisma.$StatementPayload<ExtArgs>,
        T,
        "findFirstOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Statements that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StatementFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Statements
     * const statements = await prisma.statement.findMany()
     *
     * // Get first 10 Statements
     * const statements = await prisma.statement.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const statementWithIdOnly = await prisma.statement.findMany({ select: { id: true } })
     *
     */
    findMany<T extends StatementFindManyArgs>(
      args?: SelectSubset<T, StatementFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$StatementPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>
    >;

    /**
     * Create a Statement.
     * @param {StatementCreateArgs} args - Arguments to create a Statement.
     * @example
     * // Create one Statement
     * const Statement = await prisma.statement.create({
     *   data: {
     *     // ... data to create a Statement
     *   }
     * })
     *
     */
    create<T extends StatementCreateArgs>(
      args: SelectSubset<T, StatementCreateArgs<ExtArgs>>,
    ): Prisma__StatementClient<
      $Result.GetResult<Prisma.$StatementPayload<ExtArgs>, T, "create", GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Statements.
     * @param {StatementCreateManyArgs} args - Arguments to create many Statements.
     * @example
     * // Create many Statements
     * const statement = await prisma.statement.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends StatementCreateManyArgs>(
      args?: SelectSubset<T, StatementCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Statements and returns the data saved in the database.
     * @param {StatementCreateManyAndReturnArgs} args - Arguments to create many Statements.
     * @example
     * // Create many Statements
     * const statement = await prisma.statement.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Statements and only return the `id`
     * const statementWithIdOnly = await prisma.statement.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends StatementCreateManyAndReturnArgs>(
      args?: SelectSubset<T, StatementCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$StatementPayload<ExtArgs>,
        T,
        "createManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a Statement.
     * @param {StatementDeleteArgs} args - Arguments to delete one Statement.
     * @example
     * // Delete one Statement
     * const Statement = await prisma.statement.delete({
     *   where: {
     *     // ... filter to delete one Statement
     *   }
     * })
     *
     */
    delete<T extends StatementDeleteArgs>(
      args: SelectSubset<T, StatementDeleteArgs<ExtArgs>>,
    ): Prisma__StatementClient<
      $Result.GetResult<Prisma.$StatementPayload<ExtArgs>, T, "delete", GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one Statement.
     * @param {StatementUpdateArgs} args - Arguments to update one Statement.
     * @example
     * // Update one Statement
     * const statement = await prisma.statement.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends StatementUpdateArgs>(
      args: SelectSubset<T, StatementUpdateArgs<ExtArgs>>,
    ): Prisma__StatementClient<
      $Result.GetResult<Prisma.$StatementPayload<ExtArgs>, T, "update", GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Statements.
     * @param {StatementDeleteManyArgs} args - Arguments to filter Statements to delete.
     * @example
     * // Delete a few Statements
     * const { count } = await prisma.statement.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends StatementDeleteManyArgs>(
      args?: SelectSubset<T, StatementDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Statements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StatementUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Statements
     * const statement = await prisma.statement.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends StatementUpdateManyArgs>(
      args: SelectSubset<T, StatementUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Statements and returns the data updated in the database.
     * @param {StatementUpdateManyAndReturnArgs} args - Arguments to update many Statements.
     * @example
     * // Update many Statements
     * const statement = await prisma.statement.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Statements and only return the `id`
     * const statementWithIdOnly = await prisma.statement.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends StatementUpdateManyAndReturnArgs>(
      args: SelectSubset<T, StatementUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$StatementPayload<ExtArgs>,
        T,
        "updateManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one Statement.
     * @param {StatementUpsertArgs} args - Arguments to update or create a Statement.
     * @example
     * // Update or create a Statement
     * const statement = await prisma.statement.upsert({
     *   create: {
     *     // ... data to create a Statement
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Statement we want to update
     *   }
     * })
     */
    upsert<T extends StatementUpsertArgs>(
      args: SelectSubset<T, StatementUpsertArgs<ExtArgs>>,
    ): Prisma__StatementClient<
      $Result.GetResult<Prisma.$StatementPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Statements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StatementCountArgs} args - Arguments to filter Statements to count.
     * @example
     * // Count the number of Statements
     * const count = await prisma.statement.count({
     *   where: {
     *     // ... the filter for the Statements we want to count
     *   }
     * })
     **/
    count<T extends StatementCountArgs>(
      args?: Subset<T, StatementCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], StatementCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Statement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StatementAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends StatementAggregateArgs>(
      args: Subset<T, StatementAggregateArgs>,
    ): Prisma.PrismaPromise<GetStatementAggregateType<T>>;

    /**
     * Group by Statement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StatementGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends StatementGroupByArgs,
      HasSelectOrTake extends Or<Extends<"skip", Keys<T>>, Extends<"take", Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: StatementGroupByArgs["orderBy"] }
        : { orderBy?: StatementGroupByArgs["orderBy"] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T["orderBy"]>>>,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T["by"] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, "Field ", P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, StatementGroupByArgs, OrderByArg> & InputErrors,
    ): {} extends InputErrors ? GetStatementGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Statement model
     */
    readonly fields: StatementFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Statement.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__StatementClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends UserDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, UserDefaultArgs<ExtArgs>>,
    ): Prisma__UserClient<
      | $Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>
      | Null,
      Null,
      ExtArgs,
      GlobalOmitOptions
    >;
    transactions<T extends Statement$transactionsArgs<ExtArgs> = {}>(
      args?: Subset<T, Statement$transactionsArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      | $Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>
      | Null
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Statement model
   */
  interface StatementFieldRefs {
    readonly id: FieldRef<"Statement", "Int">;
    readonly createdAt: FieldRef<"Statement", "DateTime">;
    readonly name: FieldRef<"Statement", "String">;
    readonly userId: FieldRef<"Statement", "Int">;
  }

  // Custom InputTypes
  /**
   * Statement findUnique
   */
  export type StatementFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Statement
     */
    select?: StatementSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Statement
     */
    omit?: StatementOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatementInclude<ExtArgs> | null;
    /**
     * Filter, which Statement to fetch.
     */
    where: StatementWhereUniqueInput;
  };

  /**
   * Statement findUniqueOrThrow
   */
  export type StatementFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Statement
     */
    select?: StatementSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Statement
     */
    omit?: StatementOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatementInclude<ExtArgs> | null;
    /**
     * Filter, which Statement to fetch.
     */
    where: StatementWhereUniqueInput;
  };

  /**
   * Statement findFirst
   */
  export type StatementFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Statement
     */
    select?: StatementSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Statement
     */
    omit?: StatementOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatementInclude<ExtArgs> | null;
    /**
     * Filter, which Statement to fetch.
     */
    where?: StatementWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Statements to fetch.
     */
    orderBy?: StatementOrderByWithRelationInput | StatementOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Statements.
     */
    cursor?: StatementWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Statements from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Statements.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Statements.
     */
    distinct?: StatementScalarFieldEnum | StatementScalarFieldEnum[];
  };

  /**
   * Statement findFirstOrThrow
   */
  export type StatementFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Statement
     */
    select?: StatementSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Statement
     */
    omit?: StatementOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatementInclude<ExtArgs> | null;
    /**
     * Filter, which Statement to fetch.
     */
    where?: StatementWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Statements to fetch.
     */
    orderBy?: StatementOrderByWithRelationInput | StatementOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Statements.
     */
    cursor?: StatementWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Statements from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Statements.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Statements.
     */
    distinct?: StatementScalarFieldEnum | StatementScalarFieldEnum[];
  };

  /**
   * Statement findMany
   */
  export type StatementFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Statement
     */
    select?: StatementSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Statement
     */
    omit?: StatementOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatementInclude<ExtArgs> | null;
    /**
     * Filter, which Statements to fetch.
     */
    where?: StatementWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Statements to fetch.
     */
    orderBy?: StatementOrderByWithRelationInput | StatementOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Statements.
     */
    cursor?: StatementWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Statements from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Statements.
     */
    skip?: number;
    distinct?: StatementScalarFieldEnum | StatementScalarFieldEnum[];
  };

  /**
   * Statement create
   */
  export type StatementCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Statement
     */
    select?: StatementSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Statement
     */
    omit?: StatementOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatementInclude<ExtArgs> | null;
    /**
     * The data needed to create a Statement.
     */
    data: XOR<StatementCreateInput, StatementUncheckedCreateInput>;
  };

  /**
   * Statement createMany
   */
  export type StatementCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Statements.
     */
    data: StatementCreateManyInput | StatementCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Statement createManyAndReturn
   */
  export type StatementCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Statement
     */
    select?: StatementSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Statement
     */
    omit?: StatementOmit<ExtArgs> | null;
    /**
     * The data used to create many Statements.
     */
    data: StatementCreateManyInput | StatementCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatementIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Statement update
   */
  export type StatementUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Statement
     */
    select?: StatementSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Statement
     */
    omit?: StatementOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatementInclude<ExtArgs> | null;
    /**
     * The data needed to update a Statement.
     */
    data: XOR<StatementUpdateInput, StatementUncheckedUpdateInput>;
    /**
     * Choose, which Statement to update.
     */
    where: StatementWhereUniqueInput;
  };

  /**
   * Statement updateMany
   */
  export type StatementUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Statements.
     */
    data: XOR<StatementUpdateManyMutationInput, StatementUncheckedUpdateManyInput>;
    /**
     * Filter which Statements to update
     */
    where?: StatementWhereInput;
    /**
     * Limit how many Statements to update.
     */
    limit?: number;
  };

  /**
   * Statement updateManyAndReturn
   */
  export type StatementUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Statement
     */
    select?: StatementSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Statement
     */
    omit?: StatementOmit<ExtArgs> | null;
    /**
     * The data used to update Statements.
     */
    data: XOR<StatementUpdateManyMutationInput, StatementUncheckedUpdateManyInput>;
    /**
     * Filter which Statements to update
     */
    where?: StatementWhereInput;
    /**
     * Limit how many Statements to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatementIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Statement upsert
   */
  export type StatementUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Statement
     */
    select?: StatementSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Statement
     */
    omit?: StatementOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatementInclude<ExtArgs> | null;
    /**
     * The filter to search for the Statement to update in case it exists.
     */
    where: StatementWhereUniqueInput;
    /**
     * In case the Statement found by the `where` argument doesn't exist, create a new Statement with this data.
     */
    create: XOR<StatementCreateInput, StatementUncheckedCreateInput>;
    /**
     * In case the Statement was found with the provided `where` argument, update it with this data.
     */
    update: XOR<StatementUpdateInput, StatementUncheckedUpdateInput>;
  };

  /**
   * Statement delete
   */
  export type StatementDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Statement
     */
    select?: StatementSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Statement
     */
    omit?: StatementOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatementInclude<ExtArgs> | null;
    /**
     * Filter which Statement to delete.
     */
    where: StatementWhereUniqueInput;
  };

  /**
   * Statement deleteMany
   */
  export type StatementDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Statements to delete
     */
    where?: StatementWhereInput;
    /**
     * Limit how many Statements to delete.
     */
    limit?: number;
  };

  /**
   * Statement.transactions
   */
  export type Statement$transactionsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    where?: TransactionWhereInput;
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[];
    cursor?: TransactionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[];
  };

  /**
   * Statement without action
   */
  export type StatementDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Statement
     */
    select?: StatementSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Statement
     */
    omit?: StatementOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatementInclude<ExtArgs> | null;
  };

  /**
   * Model Transaction
   */

  export type AggregateTransaction = {
    _count: TransactionCountAggregateOutputType | null;
    _avg: TransactionAvgAggregateOutputType | null;
    _sum: TransactionSumAggregateOutputType | null;
    _min: TransactionMinAggregateOutputType | null;
    _max: TransactionMaxAggregateOutputType | null;
  };

  export type TransactionAvgAggregateOutputType = {
    id: number | null;
    amount_in_cents: number | null;
    statementId: number | null;
  };

  export type TransactionSumAggregateOutputType = {
    id: number | null;
    amount_in_cents: number | null;
    statementId: number | null;
  };

  export type TransactionMinAggregateOutputType = {
    id: number | null;
    type: $Enums.TransactionType | null;
    amount_in_cents: number | null;
    label: string | null;
    description: string | null;
    createdAt: Date | null;
    statementId: number | null;
  };

  export type TransactionMaxAggregateOutputType = {
    id: number | null;
    type: $Enums.TransactionType | null;
    amount_in_cents: number | null;
    label: string | null;
    description: string | null;
    createdAt: Date | null;
    statementId: number | null;
  };

  export type TransactionCountAggregateOutputType = {
    id: number;
    type: number;
    amount_in_cents: number;
    label: number;
    description: number;
    createdAt: number;
    statementId: number;
    _all: number;
  };

  export type TransactionAvgAggregateInputType = {
    id?: true;
    amount_in_cents?: true;
    statementId?: true;
  };

  export type TransactionSumAggregateInputType = {
    id?: true;
    amount_in_cents?: true;
    statementId?: true;
  };

  export type TransactionMinAggregateInputType = {
    id?: true;
    type?: true;
    amount_in_cents?: true;
    label?: true;
    description?: true;
    createdAt?: true;
    statementId?: true;
  };

  export type TransactionMaxAggregateInputType = {
    id?: true;
    type?: true;
    amount_in_cents?: true;
    label?: true;
    description?: true;
    createdAt?: true;
    statementId?: true;
  };

  export type TransactionCountAggregateInputType = {
    id?: true;
    type?: true;
    amount_in_cents?: true;
    label?: true;
    description?: true;
    createdAt?: true;
    statementId?: true;
    _all?: true;
  };

  export type TransactionAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Transaction to aggregate.
     */
    where?: TransactionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: TransactionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Transactions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Transactions
     **/
    _count?: true | TransactionCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: TransactionAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: TransactionSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: TransactionMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: TransactionMaxAggregateInputType;
  };

  export type GetTransactionAggregateType<T extends TransactionAggregateArgs> = {
    [P in keyof T & keyof AggregateTransaction]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTransaction[P]>
      : GetScalarType<T[P], AggregateTransaction[P]>;
  };

  export type TransactionGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: TransactionWhereInput;
    orderBy?: TransactionOrderByWithAggregationInput | TransactionOrderByWithAggregationInput[];
    by: TransactionScalarFieldEnum[] | TransactionScalarFieldEnum;
    having?: TransactionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TransactionCountAggregateInputType | true;
    _avg?: TransactionAvgAggregateInputType;
    _sum?: TransactionSumAggregateInputType;
    _min?: TransactionMinAggregateInputType;
    _max?: TransactionMaxAggregateInputType;
  };

  export type TransactionGroupByOutputType = {
    id: number;
    type: $Enums.TransactionType;
    amount_in_cents: number;
    label: string;
    description: string | null;
    createdAt: Date;
    statementId: number;
    _count: TransactionCountAggregateOutputType | null;
    _avg: TransactionAvgAggregateOutputType | null;
    _sum: TransactionSumAggregateOutputType | null;
    _min: TransactionMinAggregateOutputType | null;
    _max: TransactionMaxAggregateOutputType | null;
  };

  type GetTransactionGroupByPayload<T extends TransactionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TransactionGroupByOutputType, T["by"]> & {
        [P in keyof T & keyof TransactionGroupByOutputType]: P extends "_count"
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], TransactionGroupByOutputType[P]>
          : GetScalarType<T[P], TransactionGroupByOutputType[P]>;
      }
    >
  >;

  export type TransactionSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      type?: boolean;
      amount_in_cents?: boolean;
      label?: boolean;
      description?: boolean;
      createdAt?: boolean;
      statementId?: boolean;
      statement?: boolean | StatementDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["transaction"]
  >;

  export type TransactionSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      type?: boolean;
      amount_in_cents?: boolean;
      label?: boolean;
      description?: boolean;
      createdAt?: boolean;
      statementId?: boolean;
      statement?: boolean | StatementDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["transaction"]
  >;

  export type TransactionSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      type?: boolean;
      amount_in_cents?: boolean;
      label?: boolean;
      description?: boolean;
      createdAt?: boolean;
      statementId?: boolean;
      statement?: boolean | StatementDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["transaction"]
  >;

  export type TransactionSelectScalar = {
    id?: boolean;
    type?: boolean;
    amount_in_cents?: boolean;
    label?: boolean;
    description?: boolean;
    createdAt?: boolean;
    statementId?: boolean;
  };

  export type TransactionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetOmit<
      "id" | "type" | "amount_in_cents" | "label" | "description" | "createdAt" | "statementId",
      ExtArgs["result"]["transaction"]
    >;
  export type TransactionInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    statement?: boolean | StatementDefaultArgs<ExtArgs>;
  };
  export type TransactionIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    statement?: boolean | StatementDefaultArgs<ExtArgs>;
  };
  export type TransactionIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    statement?: boolean | StatementDefaultArgs<ExtArgs>;
  };

  export type $TransactionPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: "Transaction";
    objects: {
      statement: Prisma.$StatementPayload<ExtArgs>;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: number;
        type: $Enums.TransactionType;
        amount_in_cents: number;
        label: string;
        description: string | null;
        createdAt: Date;
        statementId: number;
      },
      ExtArgs["result"]["transaction"]
    >;
    composites: {};
  };

  type TransactionGetPayload<S extends boolean | null | undefined | TransactionDefaultArgs> =
    $Result.GetResult<Prisma.$TransactionPayload, S>;

  type TransactionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TransactionFindManyArgs, "select" | "include" | "distinct" | "omit"> & {
      select?: TransactionCountAggregateInputType | true;
    };

  export interface TransactionDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>["model"]["Transaction"];
      meta: { name: "Transaction" };
    };
    /**
     * Find zero or one Transaction that matches the filter.
     * @param {TransactionFindUniqueArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TransactionFindUniqueArgs>(
      args: SelectSubset<T, TransactionFindUniqueArgs<ExtArgs>>,
    ): Prisma__TransactionClient<
      $Result.GetResult<
        Prisma.$TransactionPayload<ExtArgs>,
        T,
        "findUnique",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one Transaction that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TransactionFindUniqueOrThrowArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TransactionFindUniqueOrThrowArgs>(
      args: SelectSubset<T, TransactionFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__TransactionClient<
      $Result.GetResult<
        Prisma.$TransactionPayload<ExtArgs>,
        T,
        "findUniqueOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Transaction that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindFirstArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TransactionFindFirstArgs>(
      args?: SelectSubset<T, TransactionFindFirstArgs<ExtArgs>>,
    ): Prisma__TransactionClient<
      $Result.GetResult<
        Prisma.$TransactionPayload<ExtArgs>,
        T,
        "findFirst",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Transaction that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindFirstOrThrowArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TransactionFindFirstOrThrowArgs>(
      args?: SelectSubset<T, TransactionFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__TransactionClient<
      $Result.GetResult<
        Prisma.$TransactionPayload<ExtArgs>,
        T,
        "findFirstOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Transactions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Transactions
     * const transactions = await prisma.transaction.findMany()
     *
     * // Get first 10 Transactions
     * const transactions = await prisma.transaction.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const transactionWithIdOnly = await prisma.transaction.findMany({ select: { id: true } })
     *
     */
    findMany<T extends TransactionFindManyArgs>(
      args?: SelectSubset<T, TransactionFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>
    >;

    /**
     * Create a Transaction.
     * @param {TransactionCreateArgs} args - Arguments to create a Transaction.
     * @example
     * // Create one Transaction
     * const Transaction = await prisma.transaction.create({
     *   data: {
     *     // ... data to create a Transaction
     *   }
     * })
     *
     */
    create<T extends TransactionCreateArgs>(
      args: SelectSubset<T, TransactionCreateArgs<ExtArgs>>,
    ): Prisma__TransactionClient<
      $Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "create", GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Transactions.
     * @param {TransactionCreateManyArgs} args - Arguments to create many Transactions.
     * @example
     * // Create many Transactions
     * const transaction = await prisma.transaction.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends TransactionCreateManyArgs>(
      args?: SelectSubset<T, TransactionCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Transactions and returns the data saved in the database.
     * @param {TransactionCreateManyAndReturnArgs} args - Arguments to create many Transactions.
     * @example
     * // Create many Transactions
     * const transaction = await prisma.transaction.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Transactions and only return the `id`
     * const transactionWithIdOnly = await prisma.transaction.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends TransactionCreateManyAndReturnArgs>(
      args?: SelectSubset<T, TransactionCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$TransactionPayload<ExtArgs>,
        T,
        "createManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a Transaction.
     * @param {TransactionDeleteArgs} args - Arguments to delete one Transaction.
     * @example
     * // Delete one Transaction
     * const Transaction = await prisma.transaction.delete({
     *   where: {
     *     // ... filter to delete one Transaction
     *   }
     * })
     *
     */
    delete<T extends TransactionDeleteArgs>(
      args: SelectSubset<T, TransactionDeleteArgs<ExtArgs>>,
    ): Prisma__TransactionClient<
      $Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one Transaction.
     * @param {TransactionUpdateArgs} args - Arguments to update one Transaction.
     * @example
     * // Update one Transaction
     * const transaction = await prisma.transaction.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends TransactionUpdateArgs>(
      args: SelectSubset<T, TransactionUpdateArgs<ExtArgs>>,
    ): Prisma__TransactionClient<
      $Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "update", GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Transactions.
     * @param {TransactionDeleteManyArgs} args - Arguments to filter Transactions to delete.
     * @example
     * // Delete a few Transactions
     * const { count } = await prisma.transaction.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends TransactionDeleteManyArgs>(
      args?: SelectSubset<T, TransactionDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Transactions
     * const transaction = await prisma.transaction.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends TransactionUpdateManyArgs>(
      args: SelectSubset<T, TransactionUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Transactions and returns the data updated in the database.
     * @param {TransactionUpdateManyAndReturnArgs} args - Arguments to update many Transactions.
     * @example
     * // Update many Transactions
     * const transaction = await prisma.transaction.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Transactions and only return the `id`
     * const transactionWithIdOnly = await prisma.transaction.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends TransactionUpdateManyAndReturnArgs>(
      args: SelectSubset<T, TransactionUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$TransactionPayload<ExtArgs>,
        T,
        "updateManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one Transaction.
     * @param {TransactionUpsertArgs} args - Arguments to update or create a Transaction.
     * @example
     * // Update or create a Transaction
     * const transaction = await prisma.transaction.upsert({
     *   create: {
     *     // ... data to create a Transaction
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Transaction we want to update
     *   }
     * })
     */
    upsert<T extends TransactionUpsertArgs>(
      args: SelectSubset<T, TransactionUpsertArgs<ExtArgs>>,
    ): Prisma__TransactionClient<
      $Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionCountArgs} args - Arguments to filter Transactions to count.
     * @example
     * // Count the number of Transactions
     * const count = await prisma.transaction.count({
     *   where: {
     *     // ... the filter for the Transactions we want to count
     *   }
     * })
     **/
    count<T extends TransactionCountArgs>(
      args?: Subset<T, TransactionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], TransactionCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Transaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends TransactionAggregateArgs>(
      args: Subset<T, TransactionAggregateArgs>,
    ): Prisma.PrismaPromise<GetTransactionAggregateType<T>>;

    /**
     * Group by Transaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends TransactionGroupByArgs,
      HasSelectOrTake extends Or<Extends<"skip", Keys<T>>, Extends<"take", Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TransactionGroupByArgs["orderBy"] }
        : { orderBy?: TransactionGroupByArgs["orderBy"] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T["orderBy"]>>>,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T["by"] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, "Field ", P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, TransactionGroupByArgs, OrderByArg> & InputErrors,
    ): {} extends InputErrors ? GetTransactionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Transaction model
     */
    readonly fields: TransactionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Transaction.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TransactionClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    statement<T extends StatementDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, StatementDefaultArgs<ExtArgs>>,
    ): Prisma__StatementClient<
      | $Result.GetResult<
          Prisma.$StatementPayload<ExtArgs>,
          T,
          "findUniqueOrThrow",
          GlobalOmitOptions
        >
      | Null,
      Null,
      ExtArgs,
      GlobalOmitOptions
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Transaction model
   */
  interface TransactionFieldRefs {
    readonly id: FieldRef<"Transaction", "Int">;
    readonly type: FieldRef<"Transaction", "TransactionType">;
    readonly amount_in_cents: FieldRef<"Transaction", "Int">;
    readonly label: FieldRef<"Transaction", "String">;
    readonly description: FieldRef<"Transaction", "String">;
    readonly createdAt: FieldRef<"Transaction", "DateTime">;
    readonly statementId: FieldRef<"Transaction", "Int">;
  }

  // Custom InputTypes
  /**
   * Transaction findUnique
   */
  export type TransactionFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    /**
     * Filter, which Transaction to fetch.
     */
    where: TransactionWhereUniqueInput;
  };

  /**
   * Transaction findUniqueOrThrow
   */
  export type TransactionFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    /**
     * Filter, which Transaction to fetch.
     */
    where: TransactionWhereUniqueInput;
  };

  /**
   * Transaction findFirst
   */
  export type TransactionFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    /**
     * Filter, which Transaction to fetch.
     */
    where?: TransactionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Transactions.
     */
    cursor?: TransactionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Transactions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Transactions.
     */
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[];
  };

  /**
   * Transaction findFirstOrThrow
   */
  export type TransactionFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    /**
     * Filter, which Transaction to fetch.
     */
    where?: TransactionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Transactions.
     */
    cursor?: TransactionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Transactions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Transactions.
     */
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[];
  };

  /**
   * Transaction findMany
   */
  export type TransactionFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    /**
     * Filter, which Transactions to fetch.
     */
    where?: TransactionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Transactions.
     */
    cursor?: TransactionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Transactions.
     */
    skip?: number;
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[];
  };

  /**
   * Transaction create
   */
  export type TransactionCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    /**
     * The data needed to create a Transaction.
     */
    data: XOR<TransactionCreateInput, TransactionUncheckedCreateInput>;
  };

  /**
   * Transaction createMany
   */
  export type TransactionCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Transactions.
     */
    data: TransactionCreateManyInput | TransactionCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Transaction createManyAndReturn
   */
  export type TransactionCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null;
    /**
     * The data used to create many Transactions.
     */
    data: TransactionCreateManyInput | TransactionCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Transaction update
   */
  export type TransactionUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    /**
     * The data needed to update a Transaction.
     */
    data: XOR<TransactionUpdateInput, TransactionUncheckedUpdateInput>;
    /**
     * Choose, which Transaction to update.
     */
    where: TransactionWhereUniqueInput;
  };

  /**
   * Transaction updateMany
   */
  export type TransactionUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Transactions.
     */
    data: XOR<TransactionUpdateManyMutationInput, TransactionUncheckedUpdateManyInput>;
    /**
     * Filter which Transactions to update
     */
    where?: TransactionWhereInput;
    /**
     * Limit how many Transactions to update.
     */
    limit?: number;
  };

  /**
   * Transaction updateManyAndReturn
   */
  export type TransactionUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null;
    /**
     * The data used to update Transactions.
     */
    data: XOR<TransactionUpdateManyMutationInput, TransactionUncheckedUpdateManyInput>;
    /**
     * Filter which Transactions to update
     */
    where?: TransactionWhereInput;
    /**
     * Limit how many Transactions to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Transaction upsert
   */
  export type TransactionUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    /**
     * The filter to search for the Transaction to update in case it exists.
     */
    where: TransactionWhereUniqueInput;
    /**
     * In case the Transaction found by the `where` argument doesn't exist, create a new Transaction with this data.
     */
    create: XOR<TransactionCreateInput, TransactionUncheckedCreateInput>;
    /**
     * In case the Transaction was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TransactionUpdateInput, TransactionUncheckedUpdateInput>;
  };

  /**
   * Transaction delete
   */
  export type TransactionDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    /**
     * Filter which Transaction to delete.
     */
    where: TransactionWhereUniqueInput;
  };

  /**
   * Transaction deleteMany
   */
  export type TransactionDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Transactions to delete
     */
    where?: TransactionWhereInput;
    /**
     * Limit how many Transactions to delete.
     */
    limit?: number;
  };

  /**
   * Transaction without action
   */
  export type TransactionDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
  };

  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: "ReadUncommitted";
    ReadCommitted: "ReadCommitted";
    RepeatableRead: "RepeatableRead";
    Serializable: "Serializable";
  };

  export type TransactionIsolationLevel =
    (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];

  export const UserScalarFieldEnum: {
    id: "id";
    createdAt: "createdAt";
    email: "email";
    name: "name";
    password: "password";
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];

  export const StatementScalarFieldEnum: {
    id: "id";
    createdAt: "createdAt";
    name: "name";
    userId: "userId";
  };

  export type StatementScalarFieldEnum =
    (typeof StatementScalarFieldEnum)[keyof typeof StatementScalarFieldEnum];

  export const TransactionScalarFieldEnum: {
    id: "id";
    type: "type";
    amount_in_cents: "amount_in_cents";
    label: "label";
    description: "description";
    createdAt: "createdAt";
    statementId: "statementId";
  };

  export type TransactionScalarFieldEnum =
    (typeof TransactionScalarFieldEnum)[keyof typeof TransactionScalarFieldEnum];

  export const SortOrder: {
    asc: "asc";
    desc: "desc";
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

  export const QueryMode: {
    default: "default";
    insensitive: "insensitive";
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];

  export const NullsOrder: {
    first: "first";
    last: "last";
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];

  /**
   * Field references
   */

  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "Int">;

  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "Int[]">;

  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "DateTime">;

  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "DateTime[]"
  >;

  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "String">;

  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "String[]">;

  /**
   * Reference to a field of type 'TransactionType'
   */
  export type EnumTransactionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "TransactionType"
  >;

  /**
   * Reference to a field of type 'TransactionType[]'
   */
  export type ListEnumTransactionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "TransactionType[]"
  >;

  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "Float">;

  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "Float[]">;

  /**
   * Deep Input Types
   */

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[];
    OR?: UserWhereInput[];
    NOT?: UserWhereInput | UserWhereInput[];
    id?: IntFilter<"User"> | number;
    createdAt?: DateTimeFilter<"User"> | Date | string;
    email?: StringFilter<"User"> | string;
    name?: StringFilter<"User"> | string;
    password?: StringFilter<"User"> | string;
    statements?: StatementListRelationFilter;
  };

  export type UserOrderByWithRelationInput = {
    id?: SortOrder;
    createdAt?: SortOrder;
    email?: SortOrder;
    name?: SortOrder;
    password?: SortOrder;
    statements?: StatementOrderByRelationAggregateInput;
  };

  export type UserWhereUniqueInput = Prisma.AtLeast<
    {
      id?: number;
      email?: string;
      AND?: UserWhereInput | UserWhereInput[];
      OR?: UserWhereInput[];
      NOT?: UserWhereInput | UserWhereInput[];
      createdAt?: DateTimeFilter<"User"> | Date | string;
      name?: StringFilter<"User"> | string;
      password?: StringFilter<"User"> | string;
      statements?: StatementListRelationFilter;
    },
    "id" | "email"
  >;

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder;
    createdAt?: SortOrder;
    email?: SortOrder;
    name?: SortOrder;
    password?: SortOrder;
    _count?: UserCountOrderByAggregateInput;
    _avg?: UserAvgOrderByAggregateInput;
    _max?: UserMaxOrderByAggregateInput;
    _min?: UserMinOrderByAggregateInput;
    _sum?: UserSumOrderByAggregateInput;
  };

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[];
    OR?: UserScalarWhereWithAggregatesInput[];
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[];
    id?: IntWithAggregatesFilter<"User"> | number;
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string;
    email?: StringWithAggregatesFilter<"User"> | string;
    name?: StringWithAggregatesFilter<"User"> | string;
    password?: StringWithAggregatesFilter<"User"> | string;
  };

  export type StatementWhereInput = {
    AND?: StatementWhereInput | StatementWhereInput[];
    OR?: StatementWhereInput[];
    NOT?: StatementWhereInput | StatementWhereInput[];
    id?: IntFilter<"Statement"> | number;
    createdAt?: DateTimeFilter<"Statement"> | Date | string;
    name?: StringFilter<"Statement"> | string;
    userId?: IntFilter<"Statement"> | number;
    user?: XOR<UserScalarRelationFilter, UserWhereInput>;
    transactions?: TransactionListRelationFilter;
  };

  export type StatementOrderByWithRelationInput = {
    id?: SortOrder;
    createdAt?: SortOrder;
    name?: SortOrder;
    userId?: SortOrder;
    user?: UserOrderByWithRelationInput;
    transactions?: TransactionOrderByRelationAggregateInput;
  };

  export type StatementWhereUniqueInput = Prisma.AtLeast<
    {
      id?: number;
      AND?: StatementWhereInput | StatementWhereInput[];
      OR?: StatementWhereInput[];
      NOT?: StatementWhereInput | StatementWhereInput[];
      createdAt?: DateTimeFilter<"Statement"> | Date | string;
      name?: StringFilter<"Statement"> | string;
      userId?: IntFilter<"Statement"> | number;
      user?: XOR<UserScalarRelationFilter, UserWhereInput>;
      transactions?: TransactionListRelationFilter;
    },
    "id"
  >;

  export type StatementOrderByWithAggregationInput = {
    id?: SortOrder;
    createdAt?: SortOrder;
    name?: SortOrder;
    userId?: SortOrder;
    _count?: StatementCountOrderByAggregateInput;
    _avg?: StatementAvgOrderByAggregateInput;
    _max?: StatementMaxOrderByAggregateInput;
    _min?: StatementMinOrderByAggregateInput;
    _sum?: StatementSumOrderByAggregateInput;
  };

  export type StatementScalarWhereWithAggregatesInput = {
    AND?: StatementScalarWhereWithAggregatesInput | StatementScalarWhereWithAggregatesInput[];
    OR?: StatementScalarWhereWithAggregatesInput[];
    NOT?: StatementScalarWhereWithAggregatesInput | StatementScalarWhereWithAggregatesInput[];
    id?: IntWithAggregatesFilter<"Statement"> | number;
    createdAt?: DateTimeWithAggregatesFilter<"Statement"> | Date | string;
    name?: StringWithAggregatesFilter<"Statement"> | string;
    userId?: IntWithAggregatesFilter<"Statement"> | number;
  };

  export type TransactionWhereInput = {
    AND?: TransactionWhereInput | TransactionWhereInput[];
    OR?: TransactionWhereInput[];
    NOT?: TransactionWhereInput | TransactionWhereInput[];
    id?: IntFilter<"Transaction"> | number;
    type?: EnumTransactionTypeFilter<"Transaction"> | $Enums.TransactionType;
    amount_in_cents?: IntFilter<"Transaction"> | number;
    label?: StringFilter<"Transaction"> | string;
    description?: StringNullableFilter<"Transaction"> | string | null;
    createdAt?: DateTimeFilter<"Transaction"> | Date | string;
    statementId?: IntFilter<"Transaction"> | number;
    statement?: XOR<StatementScalarRelationFilter, StatementWhereInput>;
  };

  export type TransactionOrderByWithRelationInput = {
    id?: SortOrder;
    type?: SortOrder;
    amount_in_cents?: SortOrder;
    label?: SortOrder;
    description?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    statementId?: SortOrder;
    statement?: StatementOrderByWithRelationInput;
  };

  export type TransactionWhereUniqueInput = Prisma.AtLeast<
    {
      id?: number;
      AND?: TransactionWhereInput | TransactionWhereInput[];
      OR?: TransactionWhereInput[];
      NOT?: TransactionWhereInput | TransactionWhereInput[];
      type?: EnumTransactionTypeFilter<"Transaction"> | $Enums.TransactionType;
      amount_in_cents?: IntFilter<"Transaction"> | number;
      label?: StringFilter<"Transaction"> | string;
      description?: StringNullableFilter<"Transaction"> | string | null;
      createdAt?: DateTimeFilter<"Transaction"> | Date | string;
      statementId?: IntFilter<"Transaction"> | number;
      statement?: XOR<StatementScalarRelationFilter, StatementWhereInput>;
    },
    "id"
  >;

  export type TransactionOrderByWithAggregationInput = {
    id?: SortOrder;
    type?: SortOrder;
    amount_in_cents?: SortOrder;
    label?: SortOrder;
    description?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    statementId?: SortOrder;
    _count?: TransactionCountOrderByAggregateInput;
    _avg?: TransactionAvgOrderByAggregateInput;
    _max?: TransactionMaxOrderByAggregateInput;
    _min?: TransactionMinOrderByAggregateInput;
    _sum?: TransactionSumOrderByAggregateInput;
  };

  export type TransactionScalarWhereWithAggregatesInput = {
    AND?: TransactionScalarWhereWithAggregatesInput | TransactionScalarWhereWithAggregatesInput[];
    OR?: TransactionScalarWhereWithAggregatesInput[];
    NOT?: TransactionScalarWhereWithAggregatesInput | TransactionScalarWhereWithAggregatesInput[];
    id?: IntWithAggregatesFilter<"Transaction"> | number;
    type?: EnumTransactionTypeWithAggregatesFilter<"Transaction"> | $Enums.TransactionType;
    amount_in_cents?: IntWithAggregatesFilter<"Transaction"> | number;
    label?: StringWithAggregatesFilter<"Transaction"> | string;
    description?: StringNullableWithAggregatesFilter<"Transaction"> | string | null;
    createdAt?: DateTimeWithAggregatesFilter<"Transaction"> | Date | string;
    statementId?: IntWithAggregatesFilter<"Transaction"> | number;
  };

  export type UserCreateInput = {
    createdAt?: Date | string;
    email: string;
    name: string;
    password: string;
    statements?: StatementCreateNestedManyWithoutUserInput;
  };

  export type UserUncheckedCreateInput = {
    id?: number;
    createdAt?: Date | string;
    email: string;
    name: string;
    password: string;
    statements?: StatementUncheckedCreateNestedManyWithoutUserInput;
  };

  export type UserUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    email?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    password?: StringFieldUpdateOperationsInput | string;
    statements?: StatementUpdateManyWithoutUserNestedInput;
  };

  export type UserUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    email?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    password?: StringFieldUpdateOperationsInput | string;
    statements?: StatementUncheckedUpdateManyWithoutUserNestedInput;
  };

  export type UserCreateManyInput = {
    id?: number;
    createdAt?: Date | string;
    email: string;
    name: string;
    password: string;
  };

  export type UserUpdateManyMutationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    email?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    password?: StringFieldUpdateOperationsInput | string;
  };

  export type UserUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    email?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    password?: StringFieldUpdateOperationsInput | string;
  };

  export type StatementCreateInput = {
    createdAt?: Date | string;
    name: string;
    user: UserCreateNestedOneWithoutStatementsInput;
    transactions?: TransactionCreateNestedManyWithoutStatementInput;
  };

  export type StatementUncheckedCreateInput = {
    id?: number;
    createdAt?: Date | string;
    name: string;
    userId: number;
    transactions?: TransactionUncheckedCreateNestedManyWithoutStatementInput;
  };

  export type StatementUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    name?: StringFieldUpdateOperationsInput | string;
    user?: UserUpdateOneRequiredWithoutStatementsNestedInput;
    transactions?: TransactionUpdateManyWithoutStatementNestedInput;
  };

  export type StatementUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    name?: StringFieldUpdateOperationsInput | string;
    userId?: IntFieldUpdateOperationsInput | number;
    transactions?: TransactionUncheckedUpdateManyWithoutStatementNestedInput;
  };

  export type StatementCreateManyInput = {
    id?: number;
    createdAt?: Date | string;
    name: string;
    userId: number;
  };

  export type StatementUpdateManyMutationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    name?: StringFieldUpdateOperationsInput | string;
  };

  export type StatementUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    name?: StringFieldUpdateOperationsInput | string;
    userId?: IntFieldUpdateOperationsInput | number;
  };

  export type TransactionCreateInput = {
    type: $Enums.TransactionType;
    amount_in_cents: number;
    label: string;
    description?: string | null;
    createdAt?: Date | string;
    statement: StatementCreateNestedOneWithoutTransactionsInput;
  };

  export type TransactionUncheckedCreateInput = {
    id?: number;
    type: $Enums.TransactionType;
    amount_in_cents: number;
    label: string;
    description?: string | null;
    createdAt?: Date | string;
    statementId: number;
  };

  export type TransactionUpdateInput = {
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    amount_in_cents?: IntFieldUpdateOperationsInput | number;
    label?: StringFieldUpdateOperationsInput | string;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    statement?: StatementUpdateOneRequiredWithoutTransactionsNestedInput;
  };

  export type TransactionUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number;
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    amount_in_cents?: IntFieldUpdateOperationsInput | number;
    label?: StringFieldUpdateOperationsInput | string;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    statementId?: IntFieldUpdateOperationsInput | number;
  };

  export type TransactionCreateManyInput = {
    id?: number;
    type: $Enums.TransactionType;
    amount_in_cents: number;
    label: string;
    description?: string | null;
    createdAt?: Date | string;
    statementId: number;
  };

  export type TransactionUpdateManyMutationInput = {
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    amount_in_cents?: IntFieldUpdateOperationsInput | number;
    label?: StringFieldUpdateOperationsInput | string;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TransactionUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number;
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    amount_in_cents?: IntFieldUpdateOperationsInput | number;
    label?: StringFieldUpdateOperationsInput | string;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    statementId?: IntFieldUpdateOperationsInput | number;
  };

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntFilter<$PrismaModel> | number;
  };

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type StatementListRelationFilter = {
    every?: StatementWhereInput;
    some?: StatementWhereInput;
    none?: StatementWhereInput;
  };

  export type StatementOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder;
    createdAt?: SortOrder;
    email?: SortOrder;
    name?: SortOrder;
    password?: SortOrder;
  };

  export type UserAvgOrderByAggregateInput = {
    id?: SortOrder;
  };

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder;
    createdAt?: SortOrder;
    email?: SortOrder;
    name?: SortOrder;
    password?: SortOrder;
  };

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder;
    createdAt?: SortOrder;
    email?: SortOrder;
    name?: SortOrder;
    password?: SortOrder;
  };

  export type UserSumOrderByAggregateInput = {
    id?: SortOrder;
  };

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedFloatFilter<$PrismaModel>;
    _sum?: NestedIntFilter<$PrismaModel>;
    _min?: NestedIntFilter<$PrismaModel>;
    _max?: NestedIntFilter<$PrismaModel>;
  };

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type UserScalarRelationFilter = {
    is?: UserWhereInput;
    isNot?: UserWhereInput;
  };

  export type TransactionListRelationFilter = {
    every?: TransactionWhereInput;
    some?: TransactionWhereInput;
    none?: TransactionWhereInput;
  };

  export type TransactionOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type StatementCountOrderByAggregateInput = {
    id?: SortOrder;
    createdAt?: SortOrder;
    name?: SortOrder;
    userId?: SortOrder;
  };

  export type StatementAvgOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
  };

  export type StatementMaxOrderByAggregateInput = {
    id?: SortOrder;
    createdAt?: SortOrder;
    name?: SortOrder;
    userId?: SortOrder;
  };

  export type StatementMinOrderByAggregateInput = {
    id?: SortOrder;
    createdAt?: SortOrder;
    name?: SortOrder;
    userId?: SortOrder;
  };

  export type StatementSumOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
  };

  export type EnumTransactionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionType | EnumTransactionTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>;
    not?: NestedEnumTransactionTypeFilter<$PrismaModel> | $Enums.TransactionType;
  };

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };

  export type StatementScalarRelationFilter = {
    is?: StatementWhereInput;
    isNot?: StatementWhereInput;
  };

  export type SortOrderInput = {
    sort: SortOrder;
    nulls?: NullsOrder;
  };

  export type TransactionCountOrderByAggregateInput = {
    id?: SortOrder;
    type?: SortOrder;
    amount_in_cents?: SortOrder;
    label?: SortOrder;
    description?: SortOrder;
    createdAt?: SortOrder;
    statementId?: SortOrder;
  };

  export type TransactionAvgOrderByAggregateInput = {
    id?: SortOrder;
    amount_in_cents?: SortOrder;
    statementId?: SortOrder;
  };

  export type TransactionMaxOrderByAggregateInput = {
    id?: SortOrder;
    type?: SortOrder;
    amount_in_cents?: SortOrder;
    label?: SortOrder;
    description?: SortOrder;
    createdAt?: SortOrder;
    statementId?: SortOrder;
  };

  export type TransactionMinOrderByAggregateInput = {
    id?: SortOrder;
    type?: SortOrder;
    amount_in_cents?: SortOrder;
    label?: SortOrder;
    description?: SortOrder;
    createdAt?: SortOrder;
    statementId?: SortOrder;
  };

  export type TransactionSumOrderByAggregateInput = {
    id?: SortOrder;
    amount_in_cents?: SortOrder;
    statementId?: SortOrder;
  };

  export type EnumTransactionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionType | EnumTransactionTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>;
    not?: NestedEnumTransactionTypeWithAggregatesFilter<$PrismaModel> | $Enums.TransactionType;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumTransactionTypeFilter<$PrismaModel>;
    _max?: NestedEnumTransactionTypeFilter<$PrismaModel>;
  };

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };

  export type StatementCreateNestedManyWithoutUserInput = {
    create?:
      | XOR<StatementCreateWithoutUserInput, StatementUncheckedCreateWithoutUserInput>
      | StatementCreateWithoutUserInput[]
      | StatementUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | StatementCreateOrConnectWithoutUserInput
      | StatementCreateOrConnectWithoutUserInput[];
    createMany?: StatementCreateManyUserInputEnvelope;
    connect?: StatementWhereUniqueInput | StatementWhereUniqueInput[];
  };

  export type StatementUncheckedCreateNestedManyWithoutUserInput = {
    create?:
      | XOR<StatementCreateWithoutUserInput, StatementUncheckedCreateWithoutUserInput>
      | StatementCreateWithoutUserInput[]
      | StatementUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | StatementCreateOrConnectWithoutUserInput
      | StatementCreateOrConnectWithoutUserInput[];
    createMany?: StatementCreateManyUserInputEnvelope;
    connect?: StatementWhereUniqueInput | StatementWhereUniqueInput[];
  };

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
  };

  export type StringFieldUpdateOperationsInput = {
    set?: string;
  };

  export type StatementUpdateManyWithoutUserNestedInput = {
    create?:
      | XOR<StatementCreateWithoutUserInput, StatementUncheckedCreateWithoutUserInput>
      | StatementCreateWithoutUserInput[]
      | StatementUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | StatementCreateOrConnectWithoutUserInput
      | StatementCreateOrConnectWithoutUserInput[];
    upsert?:
      | StatementUpsertWithWhereUniqueWithoutUserInput
      | StatementUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: StatementCreateManyUserInputEnvelope;
    set?: StatementWhereUniqueInput | StatementWhereUniqueInput[];
    disconnect?: StatementWhereUniqueInput | StatementWhereUniqueInput[];
    delete?: StatementWhereUniqueInput | StatementWhereUniqueInput[];
    connect?: StatementWhereUniqueInput | StatementWhereUniqueInput[];
    update?:
      | StatementUpdateWithWhereUniqueWithoutUserInput
      | StatementUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?:
      | StatementUpdateManyWithWhereWithoutUserInput
      | StatementUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: StatementScalarWhereInput | StatementScalarWhereInput[];
  };

  export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
  };

  export type StatementUncheckedUpdateManyWithoutUserNestedInput = {
    create?:
      | XOR<StatementCreateWithoutUserInput, StatementUncheckedCreateWithoutUserInput>
      | StatementCreateWithoutUserInput[]
      | StatementUncheckedCreateWithoutUserInput[];
    connectOrCreate?:
      | StatementCreateOrConnectWithoutUserInput
      | StatementCreateOrConnectWithoutUserInput[];
    upsert?:
      | StatementUpsertWithWhereUniqueWithoutUserInput
      | StatementUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: StatementCreateManyUserInputEnvelope;
    set?: StatementWhereUniqueInput | StatementWhereUniqueInput[];
    disconnect?: StatementWhereUniqueInput | StatementWhereUniqueInput[];
    delete?: StatementWhereUniqueInput | StatementWhereUniqueInput[];
    connect?: StatementWhereUniqueInput | StatementWhereUniqueInput[];
    update?:
      | StatementUpdateWithWhereUniqueWithoutUserInput
      | StatementUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?:
      | StatementUpdateManyWithWhereWithoutUserInput
      | StatementUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: StatementScalarWhereInput | StatementScalarWhereInput[];
  };

  export type UserCreateNestedOneWithoutStatementsInput = {
    create?: XOR<UserCreateWithoutStatementsInput, UserUncheckedCreateWithoutStatementsInput>;
    connectOrCreate?: UserCreateOrConnectWithoutStatementsInput;
    connect?: UserWhereUniqueInput;
  };

  export type TransactionCreateNestedManyWithoutStatementInput = {
    create?:
      | XOR<TransactionCreateWithoutStatementInput, TransactionUncheckedCreateWithoutStatementInput>
      | TransactionCreateWithoutStatementInput[]
      | TransactionUncheckedCreateWithoutStatementInput[];
    connectOrCreate?:
      | TransactionCreateOrConnectWithoutStatementInput
      | TransactionCreateOrConnectWithoutStatementInput[];
    createMany?: TransactionCreateManyStatementInputEnvelope;
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
  };

  export type TransactionUncheckedCreateNestedManyWithoutStatementInput = {
    create?:
      | XOR<TransactionCreateWithoutStatementInput, TransactionUncheckedCreateWithoutStatementInput>
      | TransactionCreateWithoutStatementInput[]
      | TransactionUncheckedCreateWithoutStatementInput[];
    connectOrCreate?:
      | TransactionCreateOrConnectWithoutStatementInput
      | TransactionCreateOrConnectWithoutStatementInput[];
    createMany?: TransactionCreateManyStatementInputEnvelope;
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
  };

  export type UserUpdateOneRequiredWithoutStatementsNestedInput = {
    create?: XOR<UserCreateWithoutStatementsInput, UserUncheckedCreateWithoutStatementsInput>;
    connectOrCreate?: UserCreateOrConnectWithoutStatementsInput;
    upsert?: UserUpsertWithoutStatementsInput;
    connect?: UserWhereUniqueInput;
    update?: XOR<
      XOR<UserUpdateToOneWithWhereWithoutStatementsInput, UserUpdateWithoutStatementsInput>,
      UserUncheckedUpdateWithoutStatementsInput
    >;
  };

  export type TransactionUpdateManyWithoutStatementNestedInput = {
    create?:
      | XOR<TransactionCreateWithoutStatementInput, TransactionUncheckedCreateWithoutStatementInput>
      | TransactionCreateWithoutStatementInput[]
      | TransactionUncheckedCreateWithoutStatementInput[];
    connectOrCreate?:
      | TransactionCreateOrConnectWithoutStatementInput
      | TransactionCreateOrConnectWithoutStatementInput[];
    upsert?:
      | TransactionUpsertWithWhereUniqueWithoutStatementInput
      | TransactionUpsertWithWhereUniqueWithoutStatementInput[];
    createMany?: TransactionCreateManyStatementInputEnvelope;
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    update?:
      | TransactionUpdateWithWhereUniqueWithoutStatementInput
      | TransactionUpdateWithWhereUniqueWithoutStatementInput[];
    updateMany?:
      | TransactionUpdateManyWithWhereWithoutStatementInput
      | TransactionUpdateManyWithWhereWithoutStatementInput[];
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[];
  };

  export type TransactionUncheckedUpdateManyWithoutStatementNestedInput = {
    create?:
      | XOR<TransactionCreateWithoutStatementInput, TransactionUncheckedCreateWithoutStatementInput>
      | TransactionCreateWithoutStatementInput[]
      | TransactionUncheckedCreateWithoutStatementInput[];
    connectOrCreate?:
      | TransactionCreateOrConnectWithoutStatementInput
      | TransactionCreateOrConnectWithoutStatementInput[];
    upsert?:
      | TransactionUpsertWithWhereUniqueWithoutStatementInput
      | TransactionUpsertWithWhereUniqueWithoutStatementInput[];
    createMany?: TransactionCreateManyStatementInputEnvelope;
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    update?:
      | TransactionUpdateWithWhereUniqueWithoutStatementInput
      | TransactionUpdateWithWhereUniqueWithoutStatementInput[];
    updateMany?:
      | TransactionUpdateManyWithWhereWithoutStatementInput
      | TransactionUpdateManyWithWhereWithoutStatementInput[];
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[];
  };

  export type StatementCreateNestedOneWithoutTransactionsInput = {
    create?: XOR<
      StatementCreateWithoutTransactionsInput,
      StatementUncheckedCreateWithoutTransactionsInput
    >;
    connectOrCreate?: StatementCreateOrConnectWithoutTransactionsInput;
    connect?: StatementWhereUniqueInput;
  };

  export type EnumTransactionTypeFieldUpdateOperationsInput = {
    set?: $Enums.TransactionType;
  };

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
  };

  export type StatementUpdateOneRequiredWithoutTransactionsNestedInput = {
    create?: XOR<
      StatementCreateWithoutTransactionsInput,
      StatementUncheckedCreateWithoutTransactionsInput
    >;
    connectOrCreate?: StatementCreateOrConnectWithoutTransactionsInput;
    upsert?: StatementUpsertWithoutTransactionsInput;
    connect?: StatementWhereUniqueInput;
    update?: XOR<
      XOR<
        StatementUpdateToOneWithWhereWithoutTransactionsInput,
        StatementUpdateWithoutTransactionsInput
      >,
      StatementUncheckedUpdateWithoutTransactionsInput
    >;
  };

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntFilter<$PrismaModel> | number;
  };

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedFloatFilter<$PrismaModel>;
    _sum?: NestedIntFilter<$PrismaModel>;
    _min?: NestedIntFilter<$PrismaModel>;
    _max?: NestedIntFilter<$PrismaModel>;
  };

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatFilter<$PrismaModel> | number;
  };

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type NestedEnumTransactionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionType | EnumTransactionTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>;
    not?: NestedEnumTransactionTypeFilter<$PrismaModel> | $Enums.TransactionType;
  };

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };

  export type NestedEnumTransactionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionType | EnumTransactionTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>;
    not?: NestedEnumTransactionTypeWithAggregatesFilter<$PrismaModel> | $Enums.TransactionType;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumTransactionTypeFilter<$PrismaModel>;
    _max?: NestedEnumTransactionTypeFilter<$PrismaModel>;
  };

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableFilter<$PrismaModel> | number | null;
  };

  export type StatementCreateWithoutUserInput = {
    createdAt?: Date | string;
    name: string;
    transactions?: TransactionCreateNestedManyWithoutStatementInput;
  };

  export type StatementUncheckedCreateWithoutUserInput = {
    id?: number;
    createdAt?: Date | string;
    name: string;
    transactions?: TransactionUncheckedCreateNestedManyWithoutStatementInput;
  };

  export type StatementCreateOrConnectWithoutUserInput = {
    where: StatementWhereUniqueInput;
    create: XOR<StatementCreateWithoutUserInput, StatementUncheckedCreateWithoutUserInput>;
  };

  export type StatementCreateManyUserInputEnvelope = {
    data: StatementCreateManyUserInput | StatementCreateManyUserInput[];
    skipDuplicates?: boolean;
  };

  export type StatementUpsertWithWhereUniqueWithoutUserInput = {
    where: StatementWhereUniqueInput;
    update: XOR<StatementUpdateWithoutUserInput, StatementUncheckedUpdateWithoutUserInput>;
    create: XOR<StatementCreateWithoutUserInput, StatementUncheckedCreateWithoutUserInput>;
  };

  export type StatementUpdateWithWhereUniqueWithoutUserInput = {
    where: StatementWhereUniqueInput;
    data: XOR<StatementUpdateWithoutUserInput, StatementUncheckedUpdateWithoutUserInput>;
  };

  export type StatementUpdateManyWithWhereWithoutUserInput = {
    where: StatementScalarWhereInput;
    data: XOR<StatementUpdateManyMutationInput, StatementUncheckedUpdateManyWithoutUserInput>;
  };

  export type StatementScalarWhereInput = {
    AND?: StatementScalarWhereInput | StatementScalarWhereInput[];
    OR?: StatementScalarWhereInput[];
    NOT?: StatementScalarWhereInput | StatementScalarWhereInput[];
    id?: IntFilter<"Statement"> | number;
    createdAt?: DateTimeFilter<"Statement"> | Date | string;
    name?: StringFilter<"Statement"> | string;
    userId?: IntFilter<"Statement"> | number;
  };

  export type UserCreateWithoutStatementsInput = {
    createdAt?: Date | string;
    email: string;
    name: string;
    password: string;
  };

  export type UserUncheckedCreateWithoutStatementsInput = {
    id?: number;
    createdAt?: Date | string;
    email: string;
    name: string;
    password: string;
  };

  export type UserCreateOrConnectWithoutStatementsInput = {
    where: UserWhereUniqueInput;
    create: XOR<UserCreateWithoutStatementsInput, UserUncheckedCreateWithoutStatementsInput>;
  };

  export type TransactionCreateWithoutStatementInput = {
    type: $Enums.TransactionType;
    amount_in_cents: number;
    label: string;
    description?: string | null;
    createdAt?: Date | string;
  };

  export type TransactionUncheckedCreateWithoutStatementInput = {
    id?: number;
    type: $Enums.TransactionType;
    amount_in_cents: number;
    label: string;
    description?: string | null;
    createdAt?: Date | string;
  };

  export type TransactionCreateOrConnectWithoutStatementInput = {
    where: TransactionWhereUniqueInput;
    create: XOR<
      TransactionCreateWithoutStatementInput,
      TransactionUncheckedCreateWithoutStatementInput
    >;
  };

  export type TransactionCreateManyStatementInputEnvelope = {
    data: TransactionCreateManyStatementInput | TransactionCreateManyStatementInput[];
    skipDuplicates?: boolean;
  };

  export type UserUpsertWithoutStatementsInput = {
    update: XOR<UserUpdateWithoutStatementsInput, UserUncheckedUpdateWithoutStatementsInput>;
    create: XOR<UserCreateWithoutStatementsInput, UserUncheckedCreateWithoutStatementsInput>;
    where?: UserWhereInput;
  };

  export type UserUpdateToOneWithWhereWithoutStatementsInput = {
    where?: UserWhereInput;
    data: XOR<UserUpdateWithoutStatementsInput, UserUncheckedUpdateWithoutStatementsInput>;
  };

  export type UserUpdateWithoutStatementsInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    email?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    password?: StringFieldUpdateOperationsInput | string;
  };

  export type UserUncheckedUpdateWithoutStatementsInput = {
    id?: IntFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    email?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    password?: StringFieldUpdateOperationsInput | string;
  };

  export type TransactionUpsertWithWhereUniqueWithoutStatementInput = {
    where: TransactionWhereUniqueInput;
    update: XOR<
      TransactionUpdateWithoutStatementInput,
      TransactionUncheckedUpdateWithoutStatementInput
    >;
    create: XOR<
      TransactionCreateWithoutStatementInput,
      TransactionUncheckedCreateWithoutStatementInput
    >;
  };

  export type TransactionUpdateWithWhereUniqueWithoutStatementInput = {
    where: TransactionWhereUniqueInput;
    data: XOR<
      TransactionUpdateWithoutStatementInput,
      TransactionUncheckedUpdateWithoutStatementInput
    >;
  };

  export type TransactionUpdateManyWithWhereWithoutStatementInput = {
    where: TransactionScalarWhereInput;
    data: XOR<
      TransactionUpdateManyMutationInput,
      TransactionUncheckedUpdateManyWithoutStatementInput
    >;
  };

  export type TransactionScalarWhereInput = {
    AND?: TransactionScalarWhereInput | TransactionScalarWhereInput[];
    OR?: TransactionScalarWhereInput[];
    NOT?: TransactionScalarWhereInput | TransactionScalarWhereInput[];
    id?: IntFilter<"Transaction"> | number;
    type?: EnumTransactionTypeFilter<"Transaction"> | $Enums.TransactionType;
    amount_in_cents?: IntFilter<"Transaction"> | number;
    label?: StringFilter<"Transaction"> | string;
    description?: StringNullableFilter<"Transaction"> | string | null;
    createdAt?: DateTimeFilter<"Transaction"> | Date | string;
    statementId?: IntFilter<"Transaction"> | number;
  };

  export type StatementCreateWithoutTransactionsInput = {
    createdAt?: Date | string;
    name: string;
    user: UserCreateNestedOneWithoutStatementsInput;
  };

  export type StatementUncheckedCreateWithoutTransactionsInput = {
    id?: number;
    createdAt?: Date | string;
    name: string;
    userId: number;
  };

  export type StatementCreateOrConnectWithoutTransactionsInput = {
    where: StatementWhereUniqueInput;
    create: XOR<
      StatementCreateWithoutTransactionsInput,
      StatementUncheckedCreateWithoutTransactionsInput
    >;
  };

  export type StatementUpsertWithoutTransactionsInput = {
    update: XOR<
      StatementUpdateWithoutTransactionsInput,
      StatementUncheckedUpdateWithoutTransactionsInput
    >;
    create: XOR<
      StatementCreateWithoutTransactionsInput,
      StatementUncheckedCreateWithoutTransactionsInput
    >;
    where?: StatementWhereInput;
  };

  export type StatementUpdateToOneWithWhereWithoutTransactionsInput = {
    where?: StatementWhereInput;
    data: XOR<
      StatementUpdateWithoutTransactionsInput,
      StatementUncheckedUpdateWithoutTransactionsInput
    >;
  };

  export type StatementUpdateWithoutTransactionsInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    name?: StringFieldUpdateOperationsInput | string;
    user?: UserUpdateOneRequiredWithoutStatementsNestedInput;
  };

  export type StatementUncheckedUpdateWithoutTransactionsInput = {
    id?: IntFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    name?: StringFieldUpdateOperationsInput | string;
    userId?: IntFieldUpdateOperationsInput | number;
  };

  export type StatementCreateManyUserInput = {
    id?: number;
    createdAt?: Date | string;
    name: string;
  };

  export type StatementUpdateWithoutUserInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    name?: StringFieldUpdateOperationsInput | string;
    transactions?: TransactionUpdateManyWithoutStatementNestedInput;
  };

  export type StatementUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    name?: StringFieldUpdateOperationsInput | string;
    transactions?: TransactionUncheckedUpdateManyWithoutStatementNestedInput;
  };

  export type StatementUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    name?: StringFieldUpdateOperationsInput | string;
  };

  export type TransactionCreateManyStatementInput = {
    id?: number;
    type: $Enums.TransactionType;
    amount_in_cents: number;
    label: string;
    description?: string | null;
    createdAt?: Date | string;
  };

  export type TransactionUpdateWithoutStatementInput = {
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    amount_in_cents?: IntFieldUpdateOperationsInput | number;
    label?: StringFieldUpdateOperationsInput | string;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TransactionUncheckedUpdateWithoutStatementInput = {
    id?: IntFieldUpdateOperationsInput | number;
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    amount_in_cents?: IntFieldUpdateOperationsInput | number;
    label?: StringFieldUpdateOperationsInput | string;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TransactionUncheckedUpdateManyWithoutStatementInput = {
    id?: IntFieldUpdateOperationsInput | number;
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    amount_in_cents?: IntFieldUpdateOperationsInput | number;
    label?: StringFieldUpdateOperationsInput | string;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number;
  };

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF;
}
