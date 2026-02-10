# Orelse

Electron + React desktop app for role-based access to **WinCC Runtime** and **HmiNavi**, with authentication and RBAC via **Keycloak**.

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **Keycloak** server (local or remote) for login and roles
- Optional: **WinCC Runtime** and/or **HmiNavi** executables if you use those features

---

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Atharv-Pawar01/Orelse-GUI.git
   cd Orelse-GUI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment** (see [Configuration](#configuration) below)
   - Copy the example env and edit: `cp .env.example .env`
   - Or create a `.env` file with the variables described in the Configuration section.
   - Do not commit `.env` (it is in `.gitignore`).

4. **Run in development**
   ```bash
   npm run dev
   ```

5. **Build for production** (optional)
   ```bash
   npm run build
   ```
   Output is in the `out/` folder. Use Electron to run the built app.

---

## Configuration

**Keycloak (zip) step-by-step:** See **[KEYCLOAK-SETUP.md](KEYCLOAK-SETUP.md)** for a full guide (Java, download, start, realm, roles, client, users, shared `.env`).

### 1. Keycloak (required for login)

Create a `.env` file in the project root with:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_KEYCLOAK_URL` | Keycloak server base URL | `http://localhost:8080` |
| `VITE_KEYCLOAK_REALM` | Realm name (must match Keycloak exactly) | `Orelse` |
| `VITE_KEYCLOAK_CLIENT_ID` | Client ID created in Keycloak | `wincc-pam-gui` |

Example `.env`:

```env
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=Orelse
VITE_KEYCLOAK_CLIENT_ID=wincc-pam-gui
```

Restart the app after changing `.env`.

---

### 2. Keycloak server setup

You need a running Keycloak instance and a configured realm/client.

#### Run Keycloak locally

- **Docker:**
  `docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak start-dev`
- **Or** download from [keycloak.org](https://www.keycloak.org/downloads) and run `bin/kc.sh start-dev` (Linux/macOS) or `bin\kc.bat start-dev` (Windows). Requires Java 17+.

#### Configure in Keycloak Admin Console

1. Log in at `http://localhost:8080` (or your Keycloak URL).
2. **Create a realm** (e.g. `Orelse`) – name must match `VITE_KEYCLOAK_REALM` in `.env`.
3. **Realm roles:** Create roles: `Operator`, `Engineer`, `Admin` (or lowercase; the app maps both).
4. **Client:**
   - Clients → Create client
   - Client ID: `wincc-pam-gui` (or match `VITE_KEYCLOAK_CLIENT_ID`)
   - Client authentication: **OFF** (public client)
   - Valid redirect URIs: `http://localhost:5173` (dev; use the URL your app runs on)
   - Web origins: `http://localhost:5173` (or `*` for quick dev only)
   - Save
5. **User:** Create a user, set password, then in Role mapping assign one of `Operator`, `Engineer`, or `Admin`.

---

### 3. WinCC Runtime

To use **WinCC Access → Launch Runtime** from the app:

- Set one of these environment variables before starting the app:
  - `WINCC_RUNTIME_PATH` – path to the WinCC Runtime executable
  - `TEST_LAUNCH_EXE` – for testing, any `.exe` path
- Restart the app after changing.

---

### 4. HmiNavi

To use **HmiNavi Access → Launch HmiNavi**:

- Set one of:
  - `HMINAVI_PATH` – path to the HmiNavi executable
  - `TEST_HMINAVI_EXE` – for testing, any `.exe` path
- Restart the app after changing.

---

## Roles and access

| Role     | Dashboard | WinCC Access | HmiNavi Access | Edit configuration | Admin |
|----------|-----------|--------------|----------------|--------------------|-------|
| Operator | Yes       | Yes          | Yes            | No                 | No    |
| Engineer | Yes       | Yes          | Yes            | Yes (with PAM)     | No    |
| Admin    | Yes       | Yes          | Yes            | Yes (with PAM)     | Yes (with PAM) |

Edit configuration and Admin require an extra "Request privileged access" step (time-limited).

---

## Scripts

| Command          | Description                 |
|------------------|-----------------------------|
| `npm run dev`    | Run app in development mode |
| `npm run build`  | Build for production        |
| `npm run preview` | Preview renderer (Vite)    |

---

## Project structure

- `src/main/` – Electron main process (window, IPC, WinCC/HmiNavi launch)
- `src/preload/` – Preload script (exposes API to renderer)
- `src/renderer/` – React UI (login, dashboard, sections)
- `src/shared/` – Shared roles and RBAC helpers