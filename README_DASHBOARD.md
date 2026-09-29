# Tablero Monday.com - Dashboard de Gestión & Cronograma

Dashboard oficial interactivo de 2 vistas (Slides) conectado en tiempo real con el tablero de Monday.com:
- **Board URL**: [https://ibm.monday.com/boards/18432588237](https://ibm.monday.com/boards/18432588237)
- **Board ID**: `18432588237`

---

## 📌 Configuración de Solicitudes y Aprobaciones

1. **Logo Oficial IBM**: Integrado en el encabezado principal del dashboard.
2. **Creación de Solicitudes Limpia**: 
   - El formulario de registro permite ingresar **Adcar**, **Motivo Gerencia** y **Cronograma**.
   - Se ha **eliminado el campo de Estado de Aprobación** para que la aprobación quede exclusivamente bajo control de la Gerencia directamente en Monday.
3. **Filtrado de Registros**:
   - Muestra **únicamente las solicitudes enviadas/diligenciadas**, omitiendo filas vacías.
4. **Columnas Activas**:
   - **`Adcar`**: Identificador / Código del colaborador.
   - **`Motivo Gerencia`**: Novedad solicitada (*Vacaciones, Permiso Personal, Incapacidad Médica, Capacitación, etc.*).
   - **`Cronograma`**: Fechas de inicio y fin (Línea de tiempo) vinculadas al Slide 2 (Calendario).

---

## ⚡ Actualización Inmediata en Monday (Bidireccional)

Al crear o editar cualquier registro desde el dashboard, se envían las mutaciones GraphQL a la API de Monday (`https://api.monday.com/v2`), reflejando los datos de inmediato en el tablero en la nube.

---

## 🚀 Despliegue en GitHub Pages

1. Abre tu repositorio: [https://github.com/AMC304-beep/DASHBOARD-CONSTRUCCI-N](https://github.com/AMC304-beep/DASHBOARD-CONSTRUCCI-N)
2. Edita el archivo `index.html` y pega el código actualizado.
3. Haz clic en **Commit changes**.
4. Accede al sitio publicado: [https://amc304-beep.github.io/DASHBOARD-CONSTRUCCI-N/](https://amc304-beep.github.io/DASHBOARD-CONSTRUCCI-N/)
5. Ingresa tu Personal API Token desde el botón **"Token Monday"** para sincronizar en vivo.
