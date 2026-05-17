export interface Clock {
  now(): Date;
}

export const clock: Clock = {
  now(): Date {
    return new Date();
  },
};
