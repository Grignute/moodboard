Publication sur GitHub et Déploiement Vercel

Pour mettre votre Moodboard en ligne avec Vercel, suivez ces étapes simplifiées :

1. Préparer le projet sur votre ordinateur

Si vous n'avez pas encore créé le projet localement :

# Créer le dossier du projet
npm create vite@latest moodboard-grignute -- --template react
cd moodboard-grignute

# Installer les outils nécessaires
npm install
npm install firebase lucide-react


2. Configurer les fichiers

Remplacez le contenu de src/main.jsx par le code de l'application fourni précédemment.

Important : Dans src/main.jsx, insérez vos propres clés API Firebase.

3. Envoyer sur GitHub

Créez un nouveau dépôt vide sur GitHub.

Liez votre dossier local à GitHub et envoyez votre code :

git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin [https://github.com/VOTRE_NOM_UTILISATEUR/moodboard-grignute.git](https://github.com/VOTRE_NOM_UTILISATEUR/moodboard-grignute.git)
git push -u origin main


4. Déployer sur Vercel (Le plus simple)

Rendez-vous sur Vercel.com et connectez-vous avec votre compte GitHub.

Cliquez sur "Add New" > "Project".

Importez votre dépôt moodboard-grignute.

Vercel va détecter que c'est un projet Vite. Ne changez aucun réglage.

Cliquez sur "Deploy".

Félicitations ! Votre site sera en ligne sur une URL du type moodboard-grignute.vercel.app. Chaque fois que vous ferez une modification sur GitHub, Vercel mettra à jour le site automatiquement.
