/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppProvider } from './context/AppContext';
import { ScreenContainer } from './components/ScreenContainer';
import { DevControls } from './components/DevControls';
import { Header } from './components/Header';

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-[var(--bg-main)] font-sans text-[var(--text-primary)] pb-12">
        <DevControls />
        <Header />
        <main>
          <ScreenContainer />
        </main>
      </div>
    </AppProvider>
  );
}
