# Keycloak setup guide (zip installation)

Step-by-step guide to set up Keycloak using the **.zip** distribution so the Orelse app can authenticate users. Use the **same `.env`** on every machine so everyone points at the same realm and client.

---

## 1. Prerequisites

- **Java 17 or 21** (JDK).
- Check: `java -version`
- If missing: install from [Adoptium](https://adoptium.net/) or [Oracle](https://www.oracle.com/java/technologies/downloads/).

---

## 2. Download and extract Keycloak

1. Go to [keycloak.org/downloads](https://www.keycloak.org/downloads).
2. Download **Keycloak** (zip for your OS).
3. Extract the zip to a folder (e.g. `C:\Keycloak` or `~/keycloak`).
   You should see `bin`, `conf`, `lib`, etc.

---

## 3. Start Keycloak (development mode)

Open a terminal in the **Keycloak folder** (where `bin` is).

**Windows:**
```bat
bin\kc.bat start-dev
```

**Linux / macOS:**
```bash
./bin/kc.sh start-dev
```

Wait until you see something like "Keycloak ... started". The server will be at **http://localhost:8080**.

---

## 4. Create the admin user (first run only)

1. Open a browser: **http://localhost:8080**
2. If prompted to create an admin user:
   - **Username:** e.g. `admin`
   - **Password:** set and remember it
3. Click **Create** (or equivalent).
   You'll be taken to the Admin Console.

---

## 5. Create the realm (must match `.env`)

1. Top-left: open the **realm** dropdown (shows "master").
2. Click **Create realm**.
3. **Realm name:** use the **exact** value from your shared `.env`
   - If `.env` has `VITE_KEYCLOAK_REALM=Orelse` → use **Orelse**
   - Case must match.
4. Click **Create**.

---

## 6. Create realm roles (for RBAC)

1. In the left menu, open **Realm roles**.
2. Click **Create role** and add these **one by one** (name exactly as below, or all lowercase if your app mapping supports it):
   - **Operator** → Save
   - **Engineer** → Save
   - **Admin** → Save

---

## 7. Create the client (must match `.env`)

1. Left menu: **Clients** → **Create client**.
2. **General settings:**
   - **Client type:** OpenID Connect
   - **Client ID:** use the value from `.env`
     - If `VITE_KEYCLOAK_CLIENT_ID=wincc-pam-gui` → use **wincc-pam-gui**
   - **Next**
3. **Capability config:**
   - **Client authentication:** **OFF** (public client)
   - **Next**
4. **Login settings:**
   - **Root URL:** `http://localhost:5173`
   - **Valid redirect URIs:** `http://localhost:5173`
   - **Valid post logout redirect URIs:** `http://localhost:5173`
   - **Web origins:** `http://localhost:5173`
   - **Save**

(If the app will also run at another URL, add that URL to redirect URIs and Web origins.)

---

## 8. Create a user and assign a role

1. Left menu: **Users** → **Create new user**.
2. **Username:** required (e.g. `operator1`).
   **Email / First / Last name:** optional.
   **Create**.
3. Open the user → **Credentials** tab → **Set password**
   - Set password, turn **Temporary** OFF if you don't want "change password" on first login.
   **Save**.
4. **Role mapping** tab → **Assign role**
   - Choose **Filter by realm roles**
   - Select **Operator** (or **Engineer** / **Admin**)
   **Assign**.

Create more users as needed and assign Operator / Engineer / Admin.

---

## 9. Shared `.env` (everyone uses the same)

Everyone using this setup should have the **same** values in `.env` so they point at the **same** Keycloak realm and client. Example:

```env
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=Orelse
VITE_KEYCLOAK_CLIENT_ID=wincc-pam-gui
```

- **If Keycloak 16 or older** (different URL structure): use  
  `VITE_KEYCLOAK_URL=http://localhost:8080/auth`  
  and restart the app after changing.

---

## 10. Quick checklist

| Step | Action |
|------|--------|
| 1 | Install Java 17+ |
| 2 | Download Keycloak zip and extract |
| 3 | Run `bin\kc.bat start-dev` (Windows) or `./bin/kc.sh start-dev` (Linux/macOS) |
| 4 | Create admin user at http://localhost:8080 (first time) |
| 5 | Create realm with **exact** name from `.env` (e.g. **Orelse**) |
| 6 | Create realm roles: **Operator**, **Engineer**, **Admin** |
| 7 | Create client with ID from `.env` (e.g. **wincc-pam-gui**), redirect URI `http://localhost:5173` |
| 8 | Create users and assign roles |
| 9 | Use the same `.env` on every machine |

After this, run the app (`npm run dev`), open the login screen, and use "Sign in with Keycloak" with one of the users you created.
