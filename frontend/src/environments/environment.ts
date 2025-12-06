// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // Backend deployed to generic-prime namespace with v1.0.1 (bodyClass fix)
  // Using generic-prime-dockview.minilab which is already in /etc/hosts on thor (192.168.0.244)
  apiBaseUrl: 'http://generic-prime-dockview.minilab/api/specs/v1',
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
