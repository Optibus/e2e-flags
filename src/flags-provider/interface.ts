export type FlagsReturnValue = {
  features: {
    gradual: Record<string, unknown>;
  };
};

type FN = (status: string) => boolean;

export interface IFlagsProvider {
  getFlags: (query?: string, fn?: FN) => Promise<FlagsReturnValue>;

  disconnect?: () => Promise<void>;
}
