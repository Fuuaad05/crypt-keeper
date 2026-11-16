import { useEffect, useRef, useState } from "react";
import type { AppData, Settings } from "../types";
import { buildIcs, downloadFile, parseData } from "../lib/storage";

interface Props {
  data: AppData;
  onSettings: (patch: Partial<Settings>) => void;
  onImport: (data: AppData) => void;
  onDemo: () => void;
  onReset: () => void;
  notify: (message: string) => void;
}

export function Menu({ data, onSettings, onImport, onDemo, onReset, notify }: Props) {
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function toggleNotify(on: boolean) {
    if (!on) {
      onSettings({ notify: false });
      return;
    }
    if (!("Notification" in window)) {
      notify("This browser does not support notifications.");
      return;
    }
    const result = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
    if (result === "granted") {
      onSettings({ notify: true });
      notify("The crypt will whisper when a ghost is close.");
    } else {
      notify("Notifications are blocked. Allow them in your browser settings.");
    }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    file
      .text()
      .then((text) => {
        const parsed = parseData(JSON.parse(text));
        if (!parsed) throw new Error("bad shape");
        onImport(parsed);
        notify(`Imported ${parsed.tasks.length} ghosts.`);
      })
      .catch(() => notify("That file is not a Crypt Keeper backup."));
    setOpen(false);
  }

  return (
    <div className="menu" ref={boxRef}>
      <button
        type="button"
        className="btn"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        Rituals
      </button>
      {open && (
        <div className="menu-pop" role="menu">
          <label className="switch">
            <input type="checkbox" checked={data.settings.sound} onChange={(e) => onSettings({ sound: e.target.checked })} />
            <span>Sound effects</span>
          </label>
          <label className="switch">
            <input
              type="checkbox"
              checked={data.settings.ambient}
              onChange={(e) => onSettings({ ambient: e.target.checked })}
            />
            <span>Ambient wind and drone</span>
          </label>
          <label className="switch">
            <input type="checkbox" checked={data.settings.notify} onChange={(e) => void toggleNotify(e.target.checked)} />
            <span>Whisper when a ghost is near</span>
          </label>
          <hr />
          <button
            type="button"
            className="menu-item"
            onClick={() => {
              downloadFile("crypt-keeper-backup.json", JSON.stringify(data, null, 2), "application/json");
              setOpen(false);
            }}
          >
            Export backup (JSON)
          </button>
          <button type="button" className="menu-item" onClick={() => fileRef.current?.click()}>
            Import backup
          </button>
          <button
            type="button"
            className="menu-item"
            onClick={() => {
              downloadFile("crypt-keeper-deadlines.ics", buildIcs(data.tasks), "text/calendar");
              setOpen(false);
            }}
          >
            Export to calendar (.ics)
          </button>
          <hr />
          <button
            type="button"
            className="menu-item"
            onClick={() => {
              onDemo();
              setOpen(false);
            }}
          >
            Add sample ghosts
          </button>
          <button
            type="button"
            className="menu-item danger"
            onClick={() => {
              if (window.confirm("Erase every ghost and tombstone? This cannot be undone.")) onReset();
              setOpen(false);
            }}
          >
            Erase the crypt
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onFile} />
        </div>
      )}
    </div>
  );
}
