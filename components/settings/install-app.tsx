"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && Boolean(navigator.standalone));
}

export function InstallApp() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => (typeof window === "undefined" ? false : isStandalone()));
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
      setSupported(true);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    const timeout = window.setTimeout(() => {
      if (!promptEvent && !isStandalone()) setSupported(false);
    }, 1500);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [promptEvent]);

  async function install() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setPromptEvent(null);
  }

  if (installed) {
    return (
      <div className="flex items-center gap-3 rounded-lg border bg-background p-4 text-sm">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Smartphone className="size-5" />
        </span>
        <div>
          <div className="font-medium">Habitly is installed</div>
          <div className="text-muted-foreground">Open it from your home screen or app launcher.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-primary">
          <Download className="size-5" />
        </span>
        <div className="min-w-0">
          <div className="font-medium">Install Habitly</div>
          <div className="text-sm text-muted-foreground">
            {supported ? "Add Habitly to your device for a full-screen app experience." : "Use your browser menu and choose Install app or Add to Home Screen."}
          </div>
        </div>
      </div>
      <Button type="button" onClick={install} disabled={!promptEvent}>
        Install
      </Button>
    </div>
  );
}
