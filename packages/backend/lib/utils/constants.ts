/** Deployment stage — set via STAGE env var, defaults to 'dev' */
export const STAGE = process.env.STAGE || 'dev';

export const isProd = STAGE === 'prod';

export const CONSTANTS = {
  NAMING_PREFIX: `uni-verse-${STAGE}`,
  STAGE,
};
