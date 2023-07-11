export type FlagsReturnValue = {
  features: {
    gradual: Record<string, unknown>;
  };
};

export interface IFlagsProvider {
  getFlags: (query?: string) => Promise<FlagsReturnValue>;

  disconnect?: () => Promise<void>;
}
