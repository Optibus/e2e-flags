export const logger = {
  log(...args: unknown[]) {
    console.log(new Date(), ...args);
  },
  error(...args: unknown[]) {
    console.error(new Date(), ...args);
  },
};
