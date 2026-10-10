import { test, expect } from "@playwright/test";
test("consulta nueva, presupuesto con revisión, aceptación y tarea relacionados", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Nueva consulta", exact: true })
    .click();
  await page.getByLabel("Cliente existente").selectOption("c0");
  await page
    .getByLabel("Asunto", { exact: true })
    .fill("Cotización adicional de prueba");
  await page
    .getByLabel("Solicitud", { exact: true })
    .fill("Solicito una nueva cotización independiente del mismo material.");
  await page.getByRole("button", { name: "Guardar en demo" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Cotización adicional de prueba",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByLabel("Cambiar etapa").selectOption("Por presupuestar");
  await page.getByRole("tab", { name: "Presupuestos", exact: true }).click();
  await page.getByRole("button", { name: "Registrar", exact: true }).click();
  await page.getByLabel("Referencia externa").fill("PRUEBA-001");
  await page.getByLabel("Importe PYG (opcional)").fill("1200000");
  await page.getByRole("button", { name: "Guardar en demo" }).click();
  await expect(page.getByText("PRUEBA-001", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Registrar revisión" }).click();
  await page.getByLabel("Referencia externa").fill("PRUEBA-001-R2");
  await page.getByLabel("Importe PYG (opcional)").fill("1250000");
  await page.getByRole("button", { name: "Guardar en demo" }).click();
  await expect(page.getByText("Versión 1", { exact: true })).toBeVisible();
  await expect(page.getByText("Versión 2", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Registrar aceptación" }).click();
  await expect(
    page.getByText("Versión 2 · Aceptación registrada", { exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: /^Tareas/ }).click();
  await page.getByRole("button", { name: "Crear tarea", exact: true }).click();
  await page
    .getByLabel("Próxima acción", { exact: true })
    .fill("Confirmar resultado declarado");
  await page.getByRole("button", { name: "Guardar en demo" }).click();
  await expect(
    page
      .getByRole("tabpanel", { name: /^Tareas/ })
      .getByText("Confirmar resultado declarado", { exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "Clientes", exact: true }).click();
  await page
    .getByRole("button", { name: "Ver Carlos Medina", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: /Cotización adicional de prueba/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Materiales para ampliación/ }),
  ).toBeVisible();
});
