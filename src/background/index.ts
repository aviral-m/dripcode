function scheduleReminder(settings: {
  enabled: boolean;
  hour: number;
  minute: number;
}) {
  if (!settings.enabled) {
    chrome.alarms.clear("daily-drip");
    return;
  }

  const now = new Date();
  const target = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    settings.hour,
    settings.minute,
    0,
    0,
  );

  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  chrome.alarms.create("daily-drip", {
    when: target.getTime(),
    periodInMinutes: 1440,
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("dripcode_reminder_settings", (result) => {
    const settings = result.dripcode_reminder_settings as
      | { enabled: boolean; hour: number; minute: number }
      | undefined;
    if (settings?.enabled) {
      scheduleReminder(settings);
    }
  });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SET_REMINDER") {
    scheduleReminder(message.settings);
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "daily-drip") {
    chrome.notifications.create({
      type: "basic",
      title: "DripCode",
      message: "Time for your daily drip!",
      iconUrl: "icons/icon128.png",
      requireInteraction: true,
    });
  }
});
