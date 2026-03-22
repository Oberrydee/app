# Frontend e-commerce Angular

## Procédure

1. Installez Git : [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Installez Node.js `18 LTS` : [https://nodejs.org/](https://nodejs.org/)
3. Ouvrez PowerShell
4. Vérifiez les installations :

```powershell
git --version
node -v
npm -v
```

5. Récupérez le projet :

```powershell
git clone https://github.com/Oberrydee/app.git
cd app
```

6. Installez les dépendances :

```powershell
npm install
```

7. Lancez le frontend :

```powershell
npm start
```

8. Ouvrez l'application :

```text
http://localhost:4200/
```

## Important

Le frontend fonctionne avec ce backend :

```text
https://github.com/Oberrydee/e-com.git
```

Adresse locale attendue par le frontend :

```text
https://localhost:5282/api
```

Le backend doit être démarré pour que la connexion, l'inscription et le chargement des données fonctionnent.

## Erreurs possibles

### Node.js trop ancien

Message possible :

```text
The Angular CLI requires a minimum Node.js version...
```

Solution : installez ou mettez à jour Node.js en `18 LTS` depuis [https://nodejs.org/](https://nodejs.org/).

### `node` ou `npm` introuvable

Solution : fermez puis rouvrez PowerShell. Si besoin, redémarrez la machine.

### Échec de `npm install`

Solution :

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

### L'application démarre mais certaines actions échouent

Solution : vérifiez que le backend répond bien sur `https://localhost:5282/api`.
