interface TabInfo {
  id?: string;
  timeUnselected?: number;
}

interface ZoteroTabs {
  readonly selectedID: string;
  readonly _tabs: TabInfo[];
  getTabInfo(id: string): TabInfo;
  select(id: string): void;
}

const controllers = new WeakMap<Window, TabToggleController>();

export function registerTabToggle(win: _ZoteroTypes.MainWindow): void {
  if (!controllers.has(win)) {
    controllers.set(win, new TabToggleController(win));
  }
}

export function unregisterTabToggle(win: Window): void {
  controllers.get(win)?.destroy();
  controllers.delete(win);
}

class TabToggleController {
  private readonly tabs: ZoteroTabs;
  private readonly observerID: string;
  private currentTabID: string;
  private previousTabID: string | null;

  constructor(private readonly win: _ZoteroTypes.MainWindow) {
    this.tabs = win.Zotero_Tabs as unknown as ZoteroTabs;
    this.currentTabID = this.tabs.selectedID;
    this.previousTabID = this.findMostRecentUnselectedTab();

    this.observerID = Zotero.Notifier.registerObserver(
      this.observer,
      ["tab"],
      addon.data.config.addonRef,
    );

    // Zotero handles Ctrl+Tab on document during capture. Listening on window
    // lets us replace that behavior before the event reaches document.
    win.addEventListener("keydown", this.handleKeyDown, true);
  }

  destroy(): void {
    this.win.removeEventListener("keydown", this.handleKeyDown, true);
    Zotero.Notifier.unregisterObserver(this.observerID);
  }

  private readonly observer = {
    notify: (
      event: string,
      type: string,
      ids: Array<string | number>,
    ): void => {
      if (event !== "select" || type !== "tab") {
        return;
      }

      const selectedID = String(ids[0]);
      if (
        selectedID !== this.tabs.selectedID ||
        selectedID === this.currentTabID
      ) {
        return;
      }

      this.previousTabID = this.currentTabID;
      this.currentTabID = selectedID;
    },
  };

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (
      event.key !== "Tab" ||
      !event.ctrlKey ||
      event.altKey ||
      event.metaKey
    ) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    const targetID = this.getPreviousOpenTab();
    if (!targetID || targetID === this.tabs.selectedID) {
      return;
    }

    const oldCurrentID = this.currentTabID;
    this.currentTabID = targetID;
    this.previousTabID = oldCurrentID;

    try {
      this.tabs.select(targetID);
    } catch (error) {
      this.currentTabID = oldCurrentID;
      this.previousTabID = targetID;
      throw error;
    }
  };

  private getPreviousOpenTab(): string | null {
    if (
      this.previousTabID &&
      this.tabs.getTabInfo(this.previousTabID).id === this.previousTabID
    ) {
      return this.previousTabID;
    }

    this.previousTabID = this.findMostRecentUnselectedTab();
    return this.previousTabID;
  }

  private findMostRecentUnselectedTab(): string | null {
    const candidates = this.tabs._tabs.filter(
      (tab) => tab.id && tab.id !== this.tabs.selectedID,
    );
    if (!candidates.length) {
      return null;
    }

    return candidates.reduce((latest, tab) =>
      (tab.timeUnselected ?? Number.NEGATIVE_INFINITY) >
      (latest.timeUnselected ?? Number.NEGATIVE_INFINITY)
        ? tab
        : latest,
    ).id!;
  }
}
