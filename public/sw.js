self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const abierta = clients.find((client) => "focus" in client);
      if (abierta) {
        abierta.navigate("/app/recordatorios");
        return abierta.focus();
      }
      return self.clients.openWindow("/app/recordatorios");
    })
  );
});
