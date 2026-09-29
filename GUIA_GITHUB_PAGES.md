# Sincronización y Configuración Inmediata con Monday.com

Dashboard con logo oficial de IBM, conectado en vivo al tablero **18432588237** de Monday.com con actualización bidireccional inmediata.

## 📌 Columnas Activas:
1. **Logo Oficial IBM**: Incorporado en el encabezado.
2. **Adcar**: Código o identificación del colaborador.
3. **Motivo Gerencia**: Novedad solicitada (*Vacaciones, Permiso Personal, Incapacidad Médica, Capacitación, etc.*).
4. **Cronograma**: Línea de tiempo de inicio y fin (Slide 2 - Calendario).
5. **Filtrado Automático**: Muestra únicamente las solicitudes enviadas/diligenciadas, omitiendo filas vacías.

*(Columnas retiradas: Soporte Ausencia, Aprobación, Estado de Aprobación y Días Ausencias).*

---

## ⚡ Actualización Inmediata en Monday:
Al editar o crear cualquier solicitud en el dashboard, la mutación GraphQL `change_multiple_column_values` y `change_simple_column_value` se ejecuta directamente en `https://api.monday.com/v2`, reflejando los cambios de inmediato en Monday.

---

## 🚀 Pasos para actualizar en GitHub Pages:
1. Abre tu repositorio: [https://github.com/AMC304-beep/DASHBOARD-CONSTRUCCI-N](https://github.com/AMC304-beep/DASHBOARD-CONSTRUCCI-N)
2. Abre el archivo `index.html`, haz clic en ✏️ (**Edit this file**).
3. Pega todo el contenido de `index.html` y haz clic en **Commit changes...**
4. Abre la web publicada: [https://amc304-beep.github.io/DASHBOARD-CONSTRUCCI-N/](https://amc304-beep.github.io/DASHBOARD-CONSTRUCCI-N/)
5. Haz clic en **"Token Monday"** (arriba a la derecha), pega tu token personal y presiona **"Guardar y Sincronizar"**.
