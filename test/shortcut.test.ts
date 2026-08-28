import { assert } from "chai";

interface TestTabs {
  _selectedID: string;
  add(options: {
    id: string;
    type: string;
    title: string;
    data: { icon: string };
  }): { id: string };
  close(ids: string[]): void;
  select(id: string): void;
}

function pressCtrlTab(win: Window, shiftKey = false): void {
  const event = win.document.createEvent("KeyboardEvent");
  event.initKeyboardEvent(
    "keydown",
    true,
    true,
    win,
    "Tab",
    0,
    shiftKey ? "Control Shift" : "Control",
    false,
    "",
  );
  win.document.dispatchEvent(event);
}

describe("tab shortcut", function () {
  it("toggles to the most recently selected tab and ignores Shift", async function () {
    const win = Zotero.getMainWindow() as _ZoteroTypes.MainWindow & {
      Zotero_Tabs: TestTabs;
    };
    const tabs = win.Zotero_Tabs;
    const suffix = Zotero.Utilities.randomString();
    const first = tabs.add({
      id: `zoterotabfix-test-first-${suffix}`,
      type: "library",
      title: "First",
      data: { icon: "library" },
    });
    const second = tabs.add({
      id: `zoterotabfix-test-second-${suffix}`,
      type: "library",
      title: "Second",
      data: { icon: "library" },
    });

    try {
      tabs.select(first.id);
      await Zotero.Promise.delay(0);
      tabs.select(second.id);
      await Zotero.Promise.delay(0);

      pressCtrlTab(win);
      await Zotero.Promise.delay(0);
      assert.equal(
        tabs._selectedID,
        first.id,
        "Ctrl+Tab should select the MRU tab",
      );

      pressCtrlTab(win, true);
      await Zotero.Promise.delay(0);
      assert.equal(
        tabs._selectedID,
        second.id,
        "Ctrl+Shift+Tab should behave exactly like Ctrl+Tab",
      );
    } finally {
      tabs.close([first.id, second.id]);
    }
  });
});
