LeeKloud 1.1.6
========

Une API pour synchroniser vos IA qui sont sur votre ordinateur avec le site [leekwars.com](leekwars.com).

Pour l'utiliser installer [nodejs](http://nodejs.org/).

Ensuite lancer cette commande :

    node _LeeKloud.js

Sous Windows :

    cd <\chemin\de\LeeKloud\>
    node _LeeKloud.js


Un tutoriel pour installer nodejs sous windows : http://blog.idleman.fr/nodejs-15-installation-sous-windows/

Pensez à modifier le PATH de votre environnement pour que la commande "node" fonctionne sans avoir à modifier le répertoire (avec la commande cd).

Sous Linux :

	ls <\chemin\de\LeeKloud\>
	_LeeKloud.js

![Imgur](http://i.imgur.com/cWQbreB.png)

Emplacement trouvez le dossier .LeeKloud/ dans :

 - Sous Linux : regarder dans le répertoire HOME `echo $HOME` (~/Username).
 - Sous Windows : regarder dans %APPDATA% ou %USERPROFILE% (C:/Users/Username/AppData/Roaming).
 - Sous Max : regader dans le HOMEPATH (/Users/Username).

##A savoir

Modifier la variable `compare_cmd` ligne 21 pour pouvoir utiliser la fonction 'compare'. Sous windows installer [WinMerge](http://winmerge.org/).



###Problème avec la commande open

Sous windows, si vous avez un problème avec `.open [id]`, vous devez d'abord choisir un éditeur par defaut pour les fichiers ".js".

Pour définir un programme par défaut : Clique droit sur un fichier ".js" > "Ouvrir avec..." > "Choisir un programme par défaut...".


A voir aussi : https://github.com/GuimDev/LeekScript-Sublime
