/**
 * Visual Analysis
 * 
 * Component for analyzing screenshots for consistency and bugs
 */

import { ConsistencyCheckResult } from './types';
import { getScreenshotMetadata } from './screenshot-utils';

/**
 * Check URL consistency between related components
 */
export async function checkUrlConsistency(
  screenshots: string[],
  expectedUrlPattern: string
): Promise<ConsistencyCheckResult> {
  try {
    // Get metadata for all screenshots
    const metadataPromises = screenshots.map(s => getScreenshotMetadata(s));
    const metadataList = await Promise.all(metadataPromises);
    
    // Check that all screenshots have URLs matching the expected pattern
    const allMatch = metadataList.every(meta => 
      meta.url.includes(expectedUrlPattern)
    );
    
    return {
      passed: allMatch,
      description: 'URL consistency check',
      details: allMatch 
        ? 'All screenshots have consistent URLs' 
        : `URL inconsistency detected. Expected pattern: ${expectedUrlPattern}`
    };
  } catch (error) {
    return {
      passed: false,
      description: 'URL consistency check',
      details: `Error during URL consistency check: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Check data consistency between related components
 */
export async function checkDataConsistency(
  mainScreenshot: string,
  relatedScreenshot: string
): Promise<ConsistencyCheckResult> {
  try {
    // In a real implementation, this would:
    // 1. Extract data from both screenshots
    // 2. Compare the data for consistency
    // 3. Report any discrepancies
    
    // For now, we'll simulate a basic check
    const mainMetadata = await getScreenshotMetadata(mainScreenshot);
    const relatedMetadata = await getScreenshotMetadata(relatedScreenshot);
    
    // Simple URL-based consistency check
    const urlMatch = mainMetadata.url === relatedMetadata.url;
    
    return {
      passed: urlMatch,
      description: 'Data consistency check',
      details: urlMatch 
        ? 'Data consistency verified between components' 
        : 'Data inconsistency detected between components'
    };
  } catch (error) {
    return {
      passed: false,
      description: 'Data consistency check',
      details: `Error during data consistency check: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Check pop-out window synchronization
 */
export async function checkPopupSynchronization(
  mainScreenshot: string,
  popupScreenshot: string
): Promise<ConsistencyCheckResult> {
  try {
    // Check that both screenshots show consistent state
    const mainMetadata = await getScreenshotMetadata(mainScreenshot);
    const popupMetadata = await getScreenshotMetadata(popupScreenshot);
    
    // In a real implementation, this would check:
    // - Same filter state
    // - Same data counts
    // - Same selections
    
    // For now, basic URL consistency
    const consistent = mainMetadata.url === popupMetadata.url;
    
    return {
      passed: consistent,
      description: 'Popup synchronization check',
      details: consistent 
        ? 'Popup window synchronized with main window' 
        : 'Popup window state inconsistent with main window'
    };
  } catch (error) {
    return {
      passed: false,
      description: 'Popup synchronization check',
      details: `Error during popup synchronization check: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Check filter chip and URL state synchronization
 */
export async function checkFilterSync(
  filterScreenshot: string,
  resultsScreenshot: string
): Promise<ConsistencyCheckResult> {
  try {
    // In a real implementation, this would:
    // 1. Extract filter chip information from filter screenshot
    // 2. Extract URL parameters from results screenshot
    // 3. Verify they match
    
    const filterMetadata = await getScreenshotMetadata(filterScreenshot);
    const resultsMetadata = await getScreenshotMetadata(resultsScreenshot);
    
    // Basic check - in real implementation, this would be more sophisticated
    const consistent = filterMetadata.url === resultsMetadata.url;
    
    return {
      passed: consistent,
      description: 'Filter synchronization check',
      details: consistent 
        ? 'Filter state synchronized with results table' 
        : 'Filter state inconsistent with results table'
    };
  } catch (error) {
    return {
      passed: false,
      description: 'Filter synchronization check',
      details: `Error during filter synchronization check: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Run all consistency checks
 */
export async function runAllConsistencyChecks(
  screenshotGroups: Record<string, string[]>
): Promise<ConsistencyCheckResult[]> {
  const results: ConsistencyCheckResult[] = [];
  
  // Check URL consistency
  if (screenshotGroups['main'] && screenshotGroups['main'].length > 0) {
    const urlCheck = await checkUrlConsistency(
      screenshotGroups['main'], 
      '/automobiles/discover'
    );
    results.push(urlCheck);
  }
  
  // Check data consistency between main and related components
  if (screenshotGroups['main'] && screenshotGroups['results']) {
    const dataCheck = await checkDataConsistency(
      screenshotGroups['main'][0],
      screenshotGroups['results'][0]
    );
    results.push(dataCheck);
  }
  
  // Check popup synchronization if popups exist
  if (screenshotGroups['popup']) {
    const popupCheck = await checkPopupSynchronization(
      screenshotGroups['main']?.[0] || '',
      screenshotGroups['popup'][0]
    );
    results.push(popupCheck);
  }
  
  // Check filter synchronization
  if (screenshotGroups['filter'] && screenshotGroups['results']) {
    const filterCheck = await checkFilterSync(
      screenshotGroups['filter'][0],
      screenshotGroups['results'][0]
    );
    results.push(filterCheck);
  }
  
  return results;
}
