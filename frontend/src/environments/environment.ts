// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // Backend API accessed via Traefik ingress on generic-prime.minilab
  // Available in all environments: Thor SSH, dev container, and E2E tests
  apiBaseUrl: 'http://generic-prime.minilab/api/specs/v1',
  // Enable test-id attributes for E2E testing (stripped in production build)
  includeTestIds: true
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
