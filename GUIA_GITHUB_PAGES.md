# Sincronización y Configuración Inmediata con Monday.com

Este dashboard conecta las columnas del tablero **18432588237** en tiempo real y permite edición inmediata bidireccional.

## 📌 Columnas Mapeadas:
1. **Adcar**: Código o identificación del colaborador.
2. **Motivo Gerencia**: Novedad (*Vacaciones, Permiso Personal, Incapacidad, Capacitación*).
3. **Cronograma**: Línea de tiempo de inicio y fin (Slide 2 - Calendario).
4. **Estado de Aprobación**: Estado de aprobación (*Aprobado, Pendiente, Rechazado*).

---

## ⚡ Actualización Inmediata en Monday:
Al editar cualquier valor o cambiar el estado en el modal **Editar**, el dashboard ejecuta la mutación GraphQL `change_multiple_column_values` directamente sobre `https://api.monday.com/v2`, reflejando los cambios al instante en Monday.

---

## 🚀 Pasos para actualizar en GitHub Pages:
1. Abre tu repositorio: [https://github.com/AMC304-beep/DASHBOARD-CONSTRUCCI-N](https://github.com/AMC304-beep/DASHBOARD-CONSTRUCCI-N)
2. Abre el archivo `index.html`, haz clic en ✏️ (**Edit this file**).
3. Pega todo el contenido de `index.html` y haz clic en **Commit changes...**
4. Abre la web publicada: [https://amc304-beep.github.io/DASHBOARD-CONSTRUCCI-N/](https://amc304-beep.github.io/DASHBOARD-CONSTRUCCI-N/)
5. Haz clic en **"Token Monday"** (arriba a la derecha), pega tu token personal y presiona **"Guardar y Sincronizar"**.
