import { expect, test } from "@playwright/test";
import { CTA_LINK, NAV_LINKS } from "../lib/navLinks";

// Sitio completo (NEXT_PUBLIC_PRELAUNCH=false). Corre contra el segundo servidor de playwright.config.ts.

const noVerticalScroll = (page: import("@playwright/test").Page) =>
  page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight + 2);

test.describe("menú y páginas nuevas", () => {
  test("el menú es idéntico en la home y en todas las vistas (sale de lib/navLinks.ts)", async ({ page }) => {
    for (const path of ["/", "/reto", "/dona", "/manu", "/marcas", "/road-to-500", "/tienda", "/aliados"]) {
      await page.goto(path);
      const nav = page.getByRole("navigation", { name: "Principal" });
      await expect(nav.getByRole("link"), path).toHaveText(NAV_LINKS.map((l) => l.label));
      await expect(page.getByRole("link", { name: CTA_LINK.label }), path).toHaveAttribute("href", CTA_LINK.href);
    }
  });

  test("el menú incluye Aliados, Tienda y Juego", async ({ page }) => {
    await page.goto("/reto");
    const nav = page.getByRole("navigation", { name: "Principal" });
    for (const [name, href] of [["Aliados", "/aliados"], ["Tienda", "/tienda"], ["Juego", "/juego"]]) {
      await expect(nav.getByRole("link", { name })).toHaveAttribute("href", href);
    }
  });

  test("/tienda muestra las 4 categorías y no hace scroll", async ({ page }) => {
    await page.goto("/tienda");
    await expect(page.getByRole("heading", { name: "Tienda" })).toBeVisible();
    for (const n of ["Camisetas", "Posters", "Stickers", "Ropa Dissent"]) {
      await expect(page.getByText(n, { exact: true }).first()).toBeVisible();
    }
    expect(await noVerticalScroll(page)).toBe(true);
  });

  test("/aliados muestra las marcas y la tarjeta 'Tu marca aquí' lleva a /marcas", async ({ page }) => {
    await page.goto("/aliados");
    await expect(page.getByRole("heading", { name: "Aliados" })).toBeVisible();
    await expect(page.getByText(/Marca aliada 1/i)).toBeVisible();
    await page.getByRole("link", { name: /Quiero ser parte/i }).click();
    await expect(page).toHaveURL(/\/marcas$/);
  });

  test("/juego: juego + ranking + volver", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto("/juego");
    await expect(page.locator("canvas")).toBeVisible();
    await expect(page.getByRole("button", { name: "RANKING" })).toBeVisible();
    await page.getByRole("link", { name: /VOLVER/ }).click();
    await expect(page).toHaveURL(/\/$/);
    expect(errors).toEqual([]);
  });

  test("ninguna vista tiene scroll vertical (escritorio y móvil)", async ({ page }) => {
    for (const vp of [{ width: 1366, height: 768 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(vp);
      for (const path of ["/reto", "/dona", "/manu", "/marcas", "/road-to-500", "/tienda", "/aliados"]) {
        await page.goto(path);
        await page.waitForTimeout(400);
        expect(await noVerticalScroll(page), `${path} @ ${vp.width}x${vp.height}`).toBe(true);
      }
    }
  });
});

test.describe("/reto video", () => {
  test("el video de Vimeo se reproduce en la página y hay enlace al original en YouTube", async ({ page }) => {
    await page.goto("/reto");
    const yt = page.getByRole("link", { name: /Ver original en YouTube/i });
    await expect(yt).toHaveAttribute("href", /youtube\.com\/watch\?v=egdad1czyDo/);
    await expect(yt).toHaveAttribute("target", "_blank");
    await page.getByRole("button", { name: "Reproducir video" }).click();
    await expect(page.locator("iframe")).toHaveAttribute("src", /player\.vimeo\.com\/video\/1244403680/);
  });

  test("el enlace a YouTube recibe el clic (nada lo tapa)", async ({ page }) => {
    await page.goto("/reto");
    const yt = page.getByRole("link", { name: /Ver original en YouTube/i });
    const box = (await yt.boundingBox())!;
    const hit = await page.evaluate(
      ([x, y]) => document.elementFromPoint(x, y)?.closest("a")?.getAttribute("href") ?? "TAPADO",
      [box.x + box.width / 2, box.y + box.height / 2],
    );
    expect(hit).toMatch(/youtube\.com/);
  });
});

test.describe("temperatura en vivo (Santa Monica)", () => {
  test("muestra la temperatura que entrega la API, redondeada", async ({ page }) => {
    await page.route("**/api/temperature", (r) =>
      r.fulfill({ json: { celsius: 17.6, observedAt: "2026-11-06T22:00:00Z", station: "KSMO" } }),
    );
    for (const path of ["/reto", "/dona", "/manu", "/marcas", "/road-to-500"]) {
      await page.goto(path);
      await expect(page.getByTestId("live-temp"), path).toHaveText("18");
    }
  });

  test("si el servicio falla muestra '--' (nunca un número inventado)", async ({ page }) => {
    await page.route("**/api/temperature", (r) => r.fulfill({ status: 503, json: { error: "temperature_unavailable" } }));
    await page.goto("/reto");
    await page.waitForTimeout(800);
    await expect(page.getByTestId("live-temp")).toHaveText("--");
  });

  test("la ruta /api/temperature responde con la forma esperada (dato real o 503 sin red)", async ({ request }) => {
    const res = await request.get("/api/temperature");
    if (res.ok()) {
      const d = await res.json();
      expect(typeof d.celsius).toBe("number");
      expect(d.celsius).toBeGreaterThan(-60);
      expect(d.celsius).toBeLessThan(70);
      expect(d.station).toBe("KSMO");
    } else {
      expect(res.status()).toBe(503);
    }
  });
});


test.describe("cabeza de Manu arrastrable", () => {
  for (const path of ["/", "/reto"]) {
    test(`se mueve por la ruta en ${path} y vuelve con doble clic`, async ({ page }) => {
      await page.goto(path);
      if (path === "/") {
        // la home arranca con el loader del dino: espera a que aparezca y luego a que termine
        await page.locator("canvas").waitFor({ state: "attached" });
        await page.locator("canvas").waitFor({ state: "detached", timeout: 20_000 });
      }
      const head = page.getByRole("button", { name: /Manu en la ruta/ });
      await expect(head).toBeVisible();
      const map = page.locator("[data-route-map]");
      const before = await head.boundingBox();
      const m = (await map.boundingBox())!;
      // arrastra hacia el extremo derecho de la ruta (Las Vegas)
      await page.mouse.move(before!.x + before!.width / 2, before!.y + before!.height / 2);
      await page.mouse.down();
      await page.mouse.move(m.x + m.width * 0.6, m.y + m.height * 0.5, { steps: 12 });
      await page.mouse.move(m.x + m.width * 0.93, m.y + m.height * 0.4, { steps: 12 });
      await page.mouse.up();
      const after = await head.boundingBox();
      expect(after!.x).toBeGreaterThan(before!.x + m.width * 0.4);
      // sigue dentro del mapa
      expect(after!.x + after!.width / 2).toBeLessThan(m.x + m.width);
      await head.dblclick();
      const back = await head.boundingBox();
      expect(Math.abs(back!.x - before!.x)).toBeLessThan(2);
    });
  }

  test("se mueve con el teclado", async ({ page }) => {
    await page.goto("/reto");
    const head = page.getByRole("button", { name: /Manu en la ruta/ });
    const a = await head.boundingBox();
    await head.focus();
    for (let i = 0; i < 10; i++) await page.keyboard.press("ArrowRight");
    const b = await head.boundingBox();
    expect(b!.x).not.toBe(a!.x);
  });
});

test.describe("pop-up de las monedas en /dona", () => {
  test("cada moneda abre un pop-up con lo que incluye y se cierra", async ({ page }) => {
    await page.goto("/dona");
    const coins = page.getByRole("button", { name: /Ver qué incluye el pago de/ });
    await expect(coins).toHaveCount(5);
    await coins.first().click();
    const dialog = page.getByRole("dialog", { name: /Qué incluye \$ 10/ });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("listitem").first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await coins.nth(3).click();
    await expect(page.getByRole("dialog", { name: /Qué incluye \$ 400/ })).toBeVisible();
    await page.getByRole("button", { name: "Cerrar" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});
