/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppProvider } from './context/AppContext';
import { ScreenContainer } from './components/ScreenContainer';
import { DevControls } from './components/DevControls';

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-[var(--bg-main)] font-sans text-[var(--text-primary)] pb-12">
        <DevControls />
        <header className="bg-[var(--secondary)] shadow-sm border-b border-transparent pt-10 pb-4 px-4 sm:px-6 lg:px-8 mb-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[var(--secondary)] font-bold text-xl">
                M
              </div>
              <div>
                <h1 className="text-xl font-bold text-white leading-tight">Manifest Write-Off Portal</h1>
                <p className="text-xs text-blue-100">Maldives Customs Service</p>
              </div>
            </div>
          </div>
        </header>
        <main>
          <ScreenContainer />
        </main>
      </div>
    </AppProvider>
  );
}
