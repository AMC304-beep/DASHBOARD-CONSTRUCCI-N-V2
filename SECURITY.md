# IBM Construction Dashboard — Seguridad & Setup

## Arquitectura de seguridad

```
Browser (HTML/JS)
      │  fetch /api/monday/query   ← NO token aquí
      ▼
Backend proxy  (backend/server.js)
      │  Authorization: $MONDAY_API_TOKEN
      ▼
api.monday.com
```

El token de Monday.com **nunca sale del servidor**. El frontend solo habla
con el proxy local; el proxy inyecta la credencial desde `.env`.

---

## Requisitos previos

| Herramienta | Versión mínima |
|-------------|----------------|
| Node.js     | 20 LTS         |
| npm         | 10             |

---

## 1 · Configurar el entorno local

```bash
# 1. Clona el repositorio
git clone https://github.com/AMC304-beep/DASHBOARD-CONSTRUCCI-N-V2.git
cd DASHBOARD-CONSTRUCCI-N-V2

# 2. Instala dependencias del backend
cd backend
npm install

# 3. Crea tu archivo .env (NUNCA lo subas a Git)
cp .env.example .env
```

Edita `backend/.env` y rellena **solo** el valor real del token:

```
MONDAY_API_TOKEN=tu_token_real_aqui
PORT=3000
ALLOWED_ORIGINS=http://127.0.0.1:3000,http://localhost:3000
```

---

## 2 · Obtener el token de Monday.com

1. Inicia sesión en [monday.com](https://ibm.monday.com)
2. Haz clic en tu **avatar** (esquina inferior izquierda)
3. **Developers → My Access Tokens → Show → Copy**
4. Pega el valor en `backend/.env` como `MONDAY_API_TOKEN`

> ⚠️ Trata este token como una contraseña.  
> Scope requerido: `me:write`

---

## 3 · Ejecutar el servidor

```bash
# Desde la carpeta backend/
npm start          # producción
npm run dev        # desarrollo con recarga automática (nodemon)
```

Una vez iniciado, abre el navegador en:  
**http://127.0.0.1:3000**

---

## 4 · Generar un token privado en GitHub (PAT)

Usado por GitHub Actions para despliegues automáticos.

1. GitHub → **Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. **Generate new token (classic)**
3. Nombre: `DASHBOARD-DEPLOY-TOKEN`
4. Expiración: **90 días** (rota antes de que expire)
5. Scopes mínimos necesarios:
   - `repo` (lectura/escritura del repositorio)
   - `workflow` (para ejecutar Actions)
6. **Generate token → copia el valor**

### Guardar el token en GitHub Secrets

1. Ve al repositorio en GitHub
2. **Settings → Secrets and variables → Actions → New repository secret**
3. Nombre: `MONDAY_API_TOKEN`  · Valor: tu token de Monday.com  
   *(El PAT de GitHub se usa solo para el despliegue, no lo agregues aquí)*

---

## 5 · GitHub Actions — CI/CD

El workflow `.github/workflows/deploy.yml` ejecuta automáticamente:

| Job | Qué hace |
|-----|----------|
| `security-audit` | `npm audit --audit-level=high` — falla si hay vulnerabilidades HIGH/CRITICAL |
| `deploy-frontend` | Despliega los HTML estáticos a GitHub Pages |
| `deploy-backend`  | Verifica que `.env` no esté en el repo y prepara artefactos del backend |

**El token de Monday.com se inyecta como `${{ secrets.MONDAY_API_TOKEN }}`
en el entorno del backend — nunca en el código fuente.**

---

## 6 · Controles de seguridad implementados

### Backend (`backend/server.js`)

| Control | Detalle |
|---------|---------|
| Helmet.js | CSP, HSTS, X-Frame-Options, X-Content-Type-Options |
| CORS allowlist | Solo orígenes en `ALLOWED_ORIGINS` |
| Rate limiting | 100 req / 15 min / IP |
| Bind a 127.0.0.1 | Nunca a 0.0.0.0 (política IBM IT) |
| Input validation | `query` requerido, `itemId` solo dígitos, MIME allowlist |
| Keyword filter | Bloquea queries con `token`, `secret`, `password` |
| No stack traces | Clientes reciben solo mensajes genéricos |
| Logging estructurado | JSON sin datos sensibles (sin token, sin PII) |
| File upload cap | Máximo 50 MB, MIME types permitidos: PDF, JPG, PNG, DOCX, XLSX |
| TLS 1.2+ | Obligatorio en producción (configura un reverse proxy como nginx) |

### Frontend (HTML)

| Control | Detalle |
|---------|---------|
| Sin token en JS | Removido token hardcodeado de `dashboard_ausencias.html` |
| Sin localStorage de token | Ningún token se almacena en el navegador |
| Proxy exclusivo | `api()` llama a `http://127.0.0.1:3000/api/monday/query` |
| Upload via proxy | `uploadFileViaProxy()` — el token nunca pasa por el browser |

---

## 7 · Rotar el token

Si el token se compromete o expira:

```bash
# 1. Genera uno nuevo en monday.com (ver paso 2)
# 2. Actualiza backend/.env localmente
# 3. Actualiza el secreto en GitHub:
#    Settings → Secrets → MONDAY_API_TOKEN → Update
# 4. Reinicia el servidor
npm start
```

---

## 8 · Checklist de cumplimiento IBM IT

- [x] Token almacenado en `.env` (servidor) — no en código fuente
- [x] `.env` en `.gitignore` — nunca se sube a Git
- [x] HTTPS / TLS 1.2+ en producción (reverse proxy)
- [x] Servicio vincula a 127.0.0.1 — no a 0.0.0.0
- [x] Helmet.js — headers de seguridad HTTP
- [x] Rate limiting — prevención de abuso
- [x] Audit de dependencias en CI (falla en HIGH/CRITICAL, CVSS ≥ 7.0)
- [x] Sin secretos en logs
- [x] Sin stack traces expuestos al cliente
- [x] CORS restrictivo — solo orígenes autorizados
- [x] Token de GitHub con alcance mínimo y expiración de 90 días

---

## 9 · Estructura de archivos

```
/
├── index_v2.html                  # Portal principal (frontend)
├── dashboard_actualizaciones.html # Módulo Time/SF/HP + HE (frontend)
├── dashboard_ausencias.html       # Módulo ausencias (frontend)
├── .github/
│   └── workflows/
│       └── deploy.yml             # CI/CD con GitHub Actions
└── backend/
    ├── server.js                  # Servidor proxy Node.js/Express
    ├── package.json               # Dependencias del backend
    ├── .env.example               # Plantilla de variables de entorno
    ├── .env                       # ← CREAR LOCALMENTE (NO subir a Git)
    └── gitignore.txt              # Renombrar a .gitignore en el repo
```
