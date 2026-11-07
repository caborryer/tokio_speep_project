import { expect, test } from "@playwright/test";

test.describe("prelanzamiento", () => {
  test("la home muestra el juego y sin errores de página", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto("/");
    await expect(page.locator("canvas")).toBeVisible();
    await page.waitForTimeout(1500);
    expect(errors).toEqual([]);
  });

  test("las demás rutas redirigen a /", async ({ page }) => {
    for (const path of ["/reto", "/dona", "/manu", "/marcas", "/road-to-500", "/aliados", "/tienda", "/juego"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/$/);
    }
  });

  test("juego (modo invencible) corre con obstáculos avanzados sin errores", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto("/?dbg=700&god=1");
    await page.waitForTimeout(6000);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});

test.describe("ranking", () => {
  test("API: top vacío o lista y sesión firmada", async ({ request }) => {
    const top = await request.get("/api/scores");
    expect(top.ok()).toBeTruthy();
    const body = await top.json();
    expect(Array.isArray(body.top)).toBe(true);
    const ses = await request.post("/api/scores/session");
    expect(ses.ok()).toBeTruthy();
  });

  test("API: rechaza puntaje sin token ni consentimiento", async ({ request }) => {
    const res = await request.post("/api/scores", {
      data: { nickname: "Hacker", email: "h@example.com", score: 99999, token: "x", consent: false },
    });
    expect(res.ok()).toBeFalsy();
  });

  test("flujo completo: perder → guardar puntaje → ver ranking → jugar de nuevo", async ({ page }) => {
    const id = Date.now().toString(36).slice(-6).toUpperCase();
    await page.goto("/");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 40_000 }); // Manuel choca con un cactus

    await dialog.locator("input[autocomplete=nickname]").fill(`T${id}`);
    await dialog.locator("input[type=email]").fill(`t${id.toLowerCase()}@example.com`);
    await dialog.locator("input[type=checkbox]").check();
    await dialog.getByRole("button", { name: /GUARDAR PUNTAJE/i }).click();

    await expect(dialog).toContainText(/RANKING/i);
    await expect(dialog).toContainText(`T${id}`);

    await page.waitForTimeout(1200); // el botón se activa ~1 s después de cambiar de vista (anti toque accidental)
    await dialog.getByRole("button", { name: /JUGAR DE NUEVO/i }).click();
    await expect(dialog).toHaveCount(0);
  });

  test("el panel no se cierra solo aunque el usuario siga pulsando espacio / tocando", async ({ page }) => {
    await page.goto("/");
    const dialog = page.getByRole("dialog");
    // Mientras juega, pulsa espacio sin parar (como un jugador ansioso)
    const spam = setInterval(() => void page.keyboard.press("Space").catch(() => {}), 70);
    try {
      await expect(dialog).toBeVisible({ timeout: 40_000 });
      await page.waitForTimeout(2500); // sigue pulsando después de perder
      await expect(dialog).toBeVisible();
      await expect(dialog.locator("input[autocomplete=nickname]")).toBeVisible();
    } finally {
      clearInterval(spam);
    }
  });

  test("jugador ya registrado: el panel pide confirmar y NO guarda ni salta al ranking solo", async ({ page }) => {
    const id = Date.now().toString(36).slice(-6).toUpperCase();
    await page.addInitScript(
      ([n, e]) => localStorage.setItem("tsp-player", JSON.stringify({ nick: n, email: e })),
      [`R${id}`, `r${id.toLowerCase()}@example.com`],
    );
    await page.goto("/");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 40_000 });
    await expect(dialog).toContainText(`R${id}`);
    await page.waitForTimeout(2500);
    // sigue en el paso de confirmación: nada de ranking ni "¡ESTÁS #...!" sin que el jugador lo decida
    await expect(dialog.getByRole("button", { name: /GUARDAR PUNTAJE/i })).toBeVisible();
    await expect(dialog).not.toContainText(/ESTÁS #|SIGUES #/);
    await dialog.getByRole("button", { name: /GUARDAR PUNTAJE/i }).click();
    await expect(dialog).toContainText(/ESTÁS #|SIGUES #/);
  });

  test("ranking sin configurar (ej. Redis aún no conectado): nunca parpadea el formulario", async ({ page }) => {
    await page.route("**/api/scores", async (route) => {
      if (route.request().method() === "GET") {
        await new Promise((r) => setTimeout(r, 600)); // servidor lento
        return route.fulfill({ json: { configured: false, top: [] } });
      }
      return route.continue();
    });
    await page.goto("/");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 40_000 });
    for (let i = 0; i < 12; i++) {
      await expect(dialog.locator("input[autocomplete=nickname]")).toHaveCount(0);
      await page.waitForTimeout(100);
    }
    await expect(dialog).toContainText(/MUY PRONTO/i);
  });
});
