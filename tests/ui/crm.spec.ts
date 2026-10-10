import { test, expect } from "@playwright/test";
test("escritorio, atención, tareas y navegación completa", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Consultas", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Materiales para ampliación",
      exact: true,
    }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/consultas-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Materiales para ampliación", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/ficha-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Registrar atención", exact: true })
    .click();
  await page
    .getByLabel("Resultado / evidencia manual")
    .fill("Se respondió manualmente; preparar documento externo.");
  await page
    .getByRole("button", { name: "Guardar en demo", exact: true })
    .click();
  await expect(
    page
      .getByRole("dialog")
      .getByText("Sin deuda de respuesta", { exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Actividad", exact: true }).click();
  await expect(
    page.getByText("Atención manual", { exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  for (const name of [
    "Clientes",
    "Presupuestos",
    "Tareas",
    "Informes",
    "Configuración",
    "Perfil",
  ]) {
    await page.getByRole("link", { name, exact: true }).click();
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
  }
  await page.getByLabel("Cambiar perfil demo").selectOption("marta");
  await expect(
    page.getByRole("heading", { name: "Una mirada a la atención del equipo" }),
  ).toBeVisible();
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Informes", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/informes-desktop.png",
    fullPage: true,
  });
  await page.getByLabel("Vista", { exact: true }).selectOption("Seguimiento");
  await expect(
    page.getByRole("heading", { name: "Seguimientos programados" }),
  ).toBeVisible();
  await expect(page.locator(".report-section .related-record")).toHaveCount(2);
  await page.locator(".report-section .related-record").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByLabel("Vista", { exact: true }).selectOption("Resultados");
  await expect(page.locator(".report-section .related-record")).toHaveCount(3);
  await page
    .getByRole("link", { name: "Consultas", exact: false })
    .first()
    .click();
  await page.getByRole("link", { name: /Sin asignar/ }).click();
  await expect(
    page.getByRole("button", {
      name: "Cemento y varillas para obra",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Cemento y varillas para obra", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Responsable", exact: true })
    .selectOption("ana");
  await page.keyboard.press("Escape");
  await page
    .getByLabel("Vista", { exact: true })
    .selectOption("Todas las abiertas");
  await page.getByRole("button", { name: "Vista kanban" }).click();
  await expect(page.locator(".kanban")).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/kanban-desktop.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("vistas guardadas, búsqueda, validación de cierre y ficha por URL", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Filtrar por etapa").selectOption("Por presupuestar");
  await page
    .getByRole("button", { name: "Guardar vista", exact: true })
    .click();
  await page.getByLabel("Nombre", { exact: true }).fill("Preparar hoy");
  await page.getByRole("button", { name: "Guardar en demo" }).click();
  await expect(page.getByLabel("Vista", { exact: true })).toHaveValue(/.+/);
  await page.reload();
  await expect(page.getByLabel("Vista", { exact: true })).toHaveValue(/.+/);
  await page.keyboard.press("Control+k");
  await page.getByLabel("Búsqueda global").fill("1048");
  await page.locator(".search-result").first().click();
  await page.getByRole("button", { name: "Abrir ficha completa" }).click();
  await expect(page).toHaveURL(/full=1/);
  await page.reload();
  await expect(
    page.getByRole("heading", {
      name: "Materiales para ampliación",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByLabel("Cambiar etapa").selectOption("Cerrada");
  await page.getByLabel("Resultado declarado").selectOption("perdida");
  await page.getByRole("button", { name: "Confirmar cierre demo" }).click();
  await expect(page.getByRole("alert")).toContainText("Indicá un resultado");
  await page
    .getByLabel("Motivo (obligatorio para pérdida / cancelación)")
    .fill("Cliente eligió otra alternativa de prueba.");
  await page.getByRole("button", { name: "Confirmar cierre demo" }).click();
  await expect(page.getByText("Resultado: perdida")).toBeVisible();
});
test("móvil 390, navegación y teclado en ficha", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".mobile-list")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "docs/screenshots/consultas-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: /OC-1048 · Carlos Medina/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/ficha-mobile.png",
    fullPage: true,
  });
  await page.keyboard.press("Tab");
  expect(
    await page.evaluate(
      () => !!document.activeElement?.closest('[role="dialog"]'),
    ),
  ).toBe(true);
  await page.getByRole("tab", { name: "Resumen", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Actividad", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /OC-1048 · Carlos Medina/ }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Abrir navegación" }).click();
  await page.getByRole("link", { name: "Tareas", exact: false }).click();
  await expect(
    page.getByRole("heading", { name: "Tareas", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 360, height: 780 });
  await expect(
    page.getByRole("heading", { name: "Tareas", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.screenshot({
    path: "docs/screenshots/tareas-tablet.png",
    fullPage: true,
  });
});
