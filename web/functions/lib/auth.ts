import { createRemoteJWKSet, jwtVerify } from 'jose';
import { isUuid } from './validate.ts';

export type AuthedUser = { id: string; email: string | null; name: string | null };
export type Verifier = (token: string) => Promise<AuthedUser | null>;

/**
 * Builds the JWT verifier for Neon Auth tokens: EdDSA signature checked against the project's JWKS,
 * issuer must be the origin of the auth base URL, token must not be expired, and `sub` must be a UUID.
 * Returns null for anything invalid, so callers can answer 401 without leaking why.
 */
export function makeVerifier(opts: { jwksUrl: string; baseUrl: string }): Verifier {
  const jwks = createRemoteJWKSet(new URL(opts.jwksUrl));
  const issuer = new URL(opts.baseUrl).origin;
  return async (token) => {
    try {
      const { payload } = await jwtVerify(token, jwks, { issuer, algorithms: ['EdDSA'] });
      if (!isUuid(payload.sub)) return null;
      return {
        id: payload.sub,
        email: typeof payload.email === 'string' ? payload.email.slice(0, 254) : null,
        name: typeof payload.name === 'string' ? payload.name.slice(0, 100) : null,
      };
    } catch {
      return null;
    }
  };
}
