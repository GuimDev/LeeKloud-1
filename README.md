LeeKloud 1.1.4
========

Une API pour synchroniser vos IA qui sont sur votre ordinateur avec le site leekwars.com.

Pour l'utiliser installer [nodejs](http://nodejs.org/).

Ensuite lancer cette commande :

    node _LeeKloud.js

Sous Windows :

    cd <\chemin\de\LeeKloud\>
    node _LeeKloud.js

Sous Linux :

	ls <\chemin\de\LeeKloud\>
	_LeeKloud.js

![Imgur](http://i.imgur.com/cWQbreB.png)

Emplacement trouvez le dossier .LeeKloud/ dans :

 - Sous Linux : regarder dans le répertoire HOME `env |grep HOME` (~/Username).
 - Sous Windows : regarder dans %APPDATA% ou %USERPROFILE% (C:/Users/Username/AppData/Roaming).
 - Sous Max : regader dans le HOMEPATH (/Users/Username).

##A savoir

Modifier la variable `compare_cmd` ligne 21 pour pouvoir utiliser la fonction 'compare'. Sous windows installer [WinMerge](http://winmerge.org/).



###Problème avec la commande open

Sous windows, si vous avez un problème avec `.open [id]`, vous devez d'abord choisir un éditeur par defaut pour les fichiers ".js".

Pour définir un programme par défaut : Clique droit sur un fichier ".js" > "Ouvrir avec..." > "Choisir un programme par défaut...".


A voir aussi : https://github.com/GuimDev/LeekScript-Sublime
