export async function connectQZ() {
  if (!window.qz) {
    throw new Error("QZ Tray library not loaded.");
  }

  if (!window.qz.websocket.isActive()) {
    await window.qz.websocket.connect();
  }
}

export async function getPrinters() {
  await connectQZ();
  return await window.qz.printers.find();
}

export async function printRaw(zpl, printerName) {
  await connectQZ();

  const config = qz.configs.create(printerName, {
    encoding: "UTF-8"
  });

  await qz.print(config, [zpl]);
}