export const environment = {
  production: true,
  // Backend API accessed via Traefik ingress on generic-prime.minilab
  // Same hostname as development for consistency across environments
  apiBaseUrl: 'http://generic-prime.minilab/api/specs/v1',
  // Disable test-id attributes in production (cleans up HTML output)
  includeTestIds: false
};
