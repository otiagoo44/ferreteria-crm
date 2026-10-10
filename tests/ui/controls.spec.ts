import { test, expect } from "@playwright/test";

test("filtros y columnas de objetos, contraste de tokens", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Clientes", exact: true }).click();
  await page
    .getByLabel("Filtrar por tipo", { exact: true })
    .selectOption("Empresa");
  await expect(
    page.getByRole("heading", { name: "No encontramos clientes" }),
  ).toBeVisible();
  await page
    .getByLabel("Filtrar por tipo", { exact: true })
    .selectOption("Particular");
  const rows = page.locator(".standard-list tbody tr");
  await expect(rows).toHaveCount(6);
  await expect(
    page.locator(".standard-list tbody .badge").filter({ hasText: "Empresa" }),
  ).toHaveCount(0);
  await page.getByText("Columnas", { exact: true }).click();
  await page.getByLabel("Mostrar columna Localidad").uncheck();
  await expect(
    page.getByRole("columnheader", { name: "Localidad", exact: true }),
  ).toHaveCount(0);
  await page.getByText("Columnas", { exact: true }).click();
  await page.getByRole("link", { name: "Tareas", exact: true }).click();
  await page
    .getByLabel("Filtrar por tipo de tarea")
    .selectOption("Preparación");
  await expect(page.locator(".task-list-row")).toHaveCount(1);
  const ratios = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    const luminance = (name: string) => {
      const hex = style.getPropertyValue(`--colors-${name}`).trim();
      const rgb = [1, 3, 5]
        .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
        .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
      return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    };
    return [
      ["ink", "canvas"],
      ["muted", "sidebar"],
      ["primary", "canvas"],
      ["error", "error-soft"],
      ["warning", "warning-soft"],
      ["success", "success-soft"],
      ["control-border", "canvas"],
    ].map(([a, b]) => {
      const x = luminance(a),
        y = luminance(b);
      return {
        pair: `${a}/${b}`,
        ratio: (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05),
        minimum: a === "control-border" ? 3 : 4.5,
      };
    });
  });
  for (const item of ratios)
    expect(item.ratio, item.pair).toBeGreaterThanOrEqual(item.minimum);
});

test("modo real sin configuración falla explícitamente, sin fixtures", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:5184");
  await expect(
    page.getByRole("heading", {
      name: "Supabase de Occidental sin configurar",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Materiales para ampliación", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Nueva consulta" }),
  ).toHaveCount(0);
});
