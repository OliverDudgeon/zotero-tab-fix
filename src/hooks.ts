import { createZToolkit } from "./utils/ztoolkit";
import { registerTabToggle, unregisterTabToggle } from "./modules/tabToggle";

async function onStartup(): Promise<void> {
  await Promise.all([
    Zotero.initializationPromise,
    Zotero.unlockPromise,
    Zotero.uiReadyPromise,
  ]);

  await Promise.all(
    Zotero.getMainWindows().map((win) => onMainWindowLoad(win)),
  );

  addon.data.initialized = true;
}

async function onMainWindowLoad(_win: _ZoteroTypes.MainWindow): Promise<void> {
  // A toolkit instance is scoped to each Zotero window.
  addon.data.ztoolkit = createZToolkit();
  registerTabToggle(_win);
}

async function onMainWindowUnload(_win: Window): Promise<void> {
  unregisterTabToggle(_win);
  ztoolkit.unregisterAll();
}

function onShutdown(): void {
  for (const win of Zotero.getMainWindows()) {
    unregisterTabToggle(win);
  }
  ztoolkit.unregisterAll();
  addon.data.alive = false;

  // @ts-expect-error - Plugin instances are registered dynamically.
  delete Zotero[addon.data.config.addonInstance];
}

export default {
  onStartup,
  onShutdown,
  onMainWindowLoad,
  onMainWindowUnload,
};
