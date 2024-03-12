export type FlagsReturnValue = {
  features: {
    gradual: Record<string, unknown>;
  };
};

export type FlagsQuery = {
  active?: boolean;
  deprecated?: boolean;
  beforeDeployment?: boolean;
};

export interface IFlagsProvider {
  getFlags: (query?: FlagsQuery) => Promise<FlagsReturnValue>;

  disconnect?: () => Promise<void>;
}
