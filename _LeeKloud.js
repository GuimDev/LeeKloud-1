#!/usr/bin/env node

var _Vname = "LeeKloud 1.1.4";

process.title = _Vname;
process.stdout.write("\x1Bc");

var readline = require('readline'),
	querystring = require('querystring'),
	exec = require('child_process').exec,
	http = require('http'),
	fs = require('fs'),
	crypto = require('crypto'),
	path = require('path'),
	util = require('util');

var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	completer: completer
});

// Modifier cette commande par la votre. (WinMerge permet de comparer deux fichiers sous Windows).
var compare_cmd = '"C:\\Program Files (x86)\\WinMerge\\WinMergeU.exe" "%s" "%s"';

var __AI_CORES = [],
	__AI_IDS = [],
	__AI_LEVELS = [],
	__AI_NAMES = [],
	__TOKEN = "",
	__LEEK_IDS = [];

var __FILEHASH = [],
	__FILEBACK = [],
	__FILEMTIME = [];

var __fileload = 0;

var _IAfolder = "IA/",
	_WKfolder = "Workspace/";


var myCookie = "";

function fixASCII(data) { // Problème d'encodage, on vire le caractère 65279.
	while (data.charCodeAt(0) == 65279) {
		data = data.replace(/^./, "");
	}
	return data;
}

(function (folder) {
	folder += "/.LeeKloud/";
	if (!fs.existsSync(folder)) {
		fs.mkdirSync(folder);
	}
	process.chdir(folder);
	open(folder);
})(process.env.HOME || process.env.APPDATA || process.env.USERPROFILE || process.env.HOMEPATH);

function main() {
	var cfichat_urlcolor = "\033[97mhttp://chat.cfillion.tk/\033[00m";
	console.log("------------------------------ " + _Vname + " ------------------------------");
	console.log("Programme proposé par @GuimDev, certaines parties du code sont sous licence.");
	console.log("-- En partenariat avec cfiChat : " + cfichat_urlcolor + " (programmation).--");
	console.log("En cas de problème contactez moi sur le forum, ou MP HorsSujet (farmer=265).");
	console.log("----------------------------------------------------------------------------");

	[_IAfolder, _WKfolder, ".temp/", ".temp/backup/"].forEach(function(dir, index) {
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}
	});

	if (fs.existsSync(".temp/history")) {
		rl.history = JSON.parse(getFileContent(".temp/history"));
	}

	if (!fs.existsSync(".temp/cookie")) {
		console.log("Connexion nécessaire.");
		rl.question("Pseudo : ", function(pseudo) {
			hidden("Password : ", function(password) {
				$.post({
					url: "/index.php?page=login_form",
					data: {
						login: pseudo,
						pass: password
					},
					success: function(res, data) {
						if (data == "0") {
							var dataCookie = mkdataCookie(res.headers["set-cookie"]);
							setFileContent(".temp/cookie", JSON.stringify(dataCookie));

							myCookie = dataCookieToString(dataCookie);
							console.log("Connexion réussite.");

							nextStep();
						} else {
							console.log("Connexion échouée.");
							process.exit();
						}
					}
				});
			});
		});
	} else {
		var dataCookie = JSON.parse(getFileContent(".temp/cookie"));

		myCookie = dataCookieToString(dataCookie);
		console.log("Connexion automatique.");

		nextStep();
	}
}

setTimeout(main, 10);

function nextStep() {
	if (process.argv.length > 2) {
		var match = process.argv[2].match("\\[hs([0-9]+)\\]\.[A-z.]{2,9}$");
		__LEEK_IDS = JSON.parse(getFileContent(".temp/leeks"));
		__TOKEN = getFileContent(".temp/token");
		if (!match) {
			console.log("Fichier invalide. N'essaye pas de me troller ! :B")
		} else if (match[1]) {
			$.post({
				url: "/index.php?page=editor_update",
				data: {
					id: match[1],
					leek1: 2,
					myleek: __LEEK_IDS[0],
					test: true,
					"test-type": "solo",
					token: __TOKEN
				},
				context: {
					id: match[1]
				},
				success: function(res, data, context) {
					open("http://leekwars.com/fight=" + data);
				}
			});
		}
		console.log("Arrêt dans 4 secondes.");
		process.stdin.pause();
		return setTimeout(function() {
			process.exit(1);
		}, 4000);
	}

	getScripts();
}

function getScripts() {
	if (fs.existsSync(".temp/hash")) {
		__FILEHASH = JSON.parse(getFileContent(".temp/hash"));
	}
	console.log("Obtention de la liste des scripts.");
	$.get({
		url: "/editor",
		success: function(res, data) {
			if (data == "") {
				console.log("Vous n'êtes pas connecté, connectez-vous.");
				fs.unlinkSync(".temp/cookie");
				return process.exit();
			}

			__AI_CORES = JSON.parse(data.match(/<script>__AI_CORES = (.*?);<\/script>/)[1]);
			__AI_IDS = JSON.parse(data.match(/<script>__AI_IDS = (.*?);<\/script>/)[1]);
			__AI_LEVELS = JSON.parse(data.match(/<script>__AI_LEVELS = (.*?);<\/script>/)[1]);
			__AI_NAMES = JSON.parse(data.match(/<script>__AI_NAMES = (.*?);<\/script>/)[1]);
			__TOKEN = data.match(/<script>var __TOKEN = '(.*?)';<\/script>/)[1];
			setFileContent(".temp/token", __TOKEN);

			__LEEK_IDS = data.match(/<div id='([0-9]+)' class='leek myleek'>/g);
			if (__LEEK_IDS) {
				__LEEK_IDS.forEach(function(value, index) {
					__LEEK_IDS[index] = parseInt(value.match(/id='([0-9]+)'/)[1]);
				});
				setFileContent(".temp/leeks", JSON.stringify(__LEEK_IDS));
			}

			console.log("\n>> Téléchargements...");
			__AI_IDS.forEach(function(value, index) {
				loadScript(value, index, successloadScript);
			});
		}
	});
}

function parseName(name) {
	name = name.replace(/[\/]/g, "[").replace(/[\\]/g, "]");
	name = name.replace(/[:*?]/g, "!").replace(/["<>]/g, "'");
	name = name.replace(/ ?[&|] ?/g, "'n'");
	name = name.replace(/[\/\\:*?"<>&|]/g, "");

	return name;
}

function getFilePathBackup(filename) {
	return ".temp/backup/" + filename + ".back.js";
}

function getFileContent(filename) {
	return fixASCII(fs.readFileSync(filename).toString());
}

function setFileContent(filename, data) {
	return fs.writeFileSync(filename, data);
}

function __IA(id) {
	this.id = id;
	this.index = __AI_IDS.indexOf(id);
	this.name = __AI_NAMES[this.index];
	this.filename = parseName(this.name.replace("[hs", "[ks")) + "[hs" + id + "].js.lk";

	this.filepath = _IAfolder + this.filename;

	this.getIAData = function() {
		return getFileContent(this.filepath);
	};

	this.setIAData = function(data) {
		return setFileContent(this.filepath, data);
	};

	this.getHash = function() {
		return sha256(this.getIAData());
	};

	this.scandir = function() {
		var files = fs.readdirSync(_IAfolder),
			exist = false;

		for (var i = 0; i < files.length; i++) {
			if ((new RegExp("\\[hs" + this.id + "\\]\.[A-z.]{2,9}$")).test(files[i])) {
				console.log("Une IA a été renommé " + files[i] + " en " + this.filename + ".");
				fs.renameSync(_IAfolder + files[i], this.filepath);
				return true;
			}
		}

		return false;
	};

	this.syncWithServer = function(data) {
		this.setIAData(data);

		var hash = this.getHash();
		__FILEHASH[this.id] = {
			lasthash: hash,
			filehash: hash
		};
	};
}

function sendScript(id, forceUpdate) {
	forceUpdate = (forceUpdate) ? true : false;
	loadScript(id, __AI_IDS.indexOf(id), function(res, data, context) {
		var myIA = new __IA(id),
			serverhash = sha256(data),
			code = myIA.getIAData(),
			myhash = myIA.getHash();

		__FILEHASH[id].filehash = myhash;

		if (__FILEHASH[id].lasthash == serverhash || forceUpdate) {
			__FILEHASH[id].lasthash = myhash;
			$.post({
				url: "/index.php?page=editor_update",
				data: {
					id: myIA.id,
					compile: true,
					token: __TOKEN,
					code: code
				},
				context: {
					id: myIA.id
				},
				success: function(res, data, context) {
					var myIA = new __IA(id);
					data = JSON.parse(data);
					console.log(" ");
					console.log("L'envoie de \033[36m" + myIA.filename + "\033[00m " + ((data.success) ? "réussi" : "echoué") + ".");
					if (data.success) {
						console.log("Niveau : " + data.level + " Coeur : " + data.core);
					} else if (data.error && data.line && data.char) { // Gestion des erreurs :
						console.log(" ");
						var codeline = code.replace(/\t/g, "    ").split("\n"),
							l = parseInt(data.line),
							s = (l + " ").length,
							pos = (s + 2) + code.split("\n")[l - 1].replace(/[^\t]/g, "").length * 3 + parseInt(data.char);

						for (var i = l - 5; i < l; i++) {
							alignLine(i + 1, codeline[i], s, pos);
						}
						console.log(Array(pos).join(" ") + "\033[91m^\033[00m");
						console.log("Error: " + data.error + " (ligne : " + data.line + ", caract : " + data.char + ").");
					} else {
						console.log("Le serveur retourne une erreur inconnu. Compilation ? Problème lors de l'envois ?");
					}
				}
			});
			setFileContent(".temp/hash", JSON.stringify(__FILEHASH));
		} else {
			console.log("La version du serveur est différente, elle a été changé depuis le dernier téléchargement. Forcez l'envois avec la commande \"\033[97m.forceupdate " + myIA.id + "\033[00m\".");
			rl.history.unshift(".forceupdate " + myIA.id);
		}
	});
}

function alignLine(num, text, longer, maxsize) {
	var maxlength = process.stdout.columns;
	num = num + Array(longer - (num + "").length).join(" ");
	maxlength -= num.length + 3;
	console.log("\033[36m" + num + " |\033[00m " + text.slice(0, (maxsize < maxlength) ? maxlength : maxsize));
}

function loadScript(value, index, success) {
	console.log("- Requête pour \033[36m" + __AI_NAMES[index] + "\033[00m.");
	var myIA = new __IA(value);
	$.post({
		url: "/index.php?page=editor_update",
		data: {
			id: myIA.id,
			load: true,
			token: __TOKEN
		},
		context: {
			id: myIA.id
		},
		success: function(res, data, context) {
			// Reprise de la modif de Pilow : "Là y'a un souci, le code présente une ligne de plus :/ On la dégage"
			data = data.slice(0, -1);
			success(res, data, context);
		}
	});
}

function successloadScript(res, data, context) {
	if (data == "") {
		return;
	}

	var myIA = new __IA(context.id),
		serverhash = sha256(data),
		type = "",
		action = "";

	if (fs.existsSync(myIA.filepath)) {
		if (!__FILEHASH[myIA.id]) {
			__FILEHASH[myIA.id] = {
				lasthash: 12
			};
		}
		__FILEHASH[myIA.id].filehash = myIA.getHash();
	} else if (__FILEHASH[myIA.id]) {
		if (!myIA.scandir()) {
			delete __FILEHASH[myIA.id];
		}
	}

	var thash = __FILEHASH[myIA.id];
	if (!thash) {
		type = "\033[96mCreation";
		action = 1;
	} else if (thash.filehash == serverhash) { //thash.lasthash == thash.filehash
		type = "\033[95mIdentique";
		action = 0;
	} else if (thash.lasthash == 12) {
		type = "\033[93mHash manquant";
		action = 4;
	} else if (thash.lasthash == thash.filehash && thash.filehash != serverhash) {
		type = "\033[96mServeur changé";
		action = 1;
	} else if (thash.lasthash == serverhash && thash.filehash != serverhash) {
		type = "\033[92mClient changé";
		action = 2;
	} else if (thash.lasthash != thash.filehash && thash.filehash != serverhash) {
		type = "\033[93mS & C changé";
		action = 3;
	} else {
		type = "\033[91mSi tu me vois dis le sur le forum (err:2-" + thash.lasthash + "-" + thash.filehash + "-" + serverhash + ").";
	}

	console.log(" ");
	if (action === 1 || action === 4) {
		console.log("- Téléchargement de \033[36m" + myIA.filename + "\033[00m (fichier distant plus récent).");
		if (action === 4) {
			backup_change(action, myIA.id);
		}
		myIA.syncWithServer(data);
	} else if (action === 2 || action === 3) {
		console.log("- Envoie de \033[36m" + myIA.filename + "\033[00m (fichier local plus récent).");
		sendScript(myIA.id, true);
		if (action === 3) {
			backup_change(action, myIA.id, data);
		}
	} else if (action === 0) {
		console.log("- \033[36m" + myIA.filename + "\033[00m.");
	} else {
		console.log("\033[91mSi tu me vois dis le sur le forum (err:3).\033[00m");
	}

	console.log("--- ETAT : \033[36m" + type + "\033[00m\n");

	if (__fileload++ && __fileload >= __AI_IDS.length) {
		console.log(" \n>> Tous les téléchargements sont terminés.\n");
	}
	setFileContent(".temp/hash", JSON.stringify(__FILEHASH));

	fs.stat(myIA.filepath, function(err, stats) {
		__FILEMTIME[myIA.id] = new Date(stats.mtime).getTime();
	});

	fs.watch(myIA.filepath, function(event, filename) {
		filename = _IAfolder + filename;
		if (filename && event == "change") {
			fs.stat(filename, function(err, stats) {
				var mtime = new Date(stats.mtime).getTime(),
					hash = sha256(getFileContent(filename));
				if (__FILEMTIME[myIA.id] != mtime && __FILEHASH[myIA.id].filehash != hash) {
					console.log("\033[36m" + filename + "\033[00m a changé.");
					__FILEHASH[myIA.id].filehash = hash;
					sendScript(myIA.id, false);
				}
				__FILEMTIME[myIA.id] = mtime;
			});
		}
	});
}
var $ = {
	post: post,
	get: get
};

function backup_change(action, id, data) {
	var localapplique = (action == 3) ? true : false,
		myIA = new __IA(id);

	var applique = (localapplique) ? "\033[92mversion locale" : "\033[96mversion distante",
		backup = (localapplique) ? "\033[96mversion distante" : "\033[92mversion locale";

	if (action == 3) {
		setFileContent(".temp/backup/" + myIA.filename + ".back.js", data);
	} else if (action == 4) {
		setFileContent(".temp/backup/" + myIA.filename + ".back.js", myIA.getIAData());
	} else {
		return console.log("\033[91mSi tu me vois dis le sur le forum (err:4).\033[00m");
	}
	console.log("- La " + applique + "\033[00m a été appliqué, vous pouvez choisir la " + backup + "\033[00m avec la commande \"\033[97m.backup " + myIA.id + "\033[00m\".");

	rl.history.unshift(".backup " + myIA.id + " restore");
	__FILEBACK[myIA.index] = myIA.id;
}

function showListIA() {
	console.log("Liste des IA :");
	__AI_IDS.forEach(function(id, index) {
		console.log("- \033[36m" + id + "\033[00m : \033[36m" + __AI_NAMES[index] + "\033[00m.");
	});
}

function useCommande(line) {
	var commande = line.split(" ");
	if (commande[0] == ".backup") {
		var id = parseInt(commande[1]),
			index = __AI_IDS.indexOf(id);

		if (index != -1 && __FILEBACK[index] == id) {
			var myIA = new __IA(id),
				filenameback = getFilePathBackup(filename);

			if (commande[2] == "restore") {
				var backup = "";
				console.log("Le backup de \033[36m" + myIA.filename + "\033[00m a été restauré. Vous pouvez réutiliser la précédente commande si vous changez d'avis.");
				backup = myIA.getIAData(filenameback);
				setFileContent(filenameback, myIA.getIAData());
				myIA.setIAData(backup);
			} else if (commande[2] == "open") {
				console.log("Le backup de \033[36m" + myIA.filename + "\033[00m a été ouvert.");
				open(filenameback);
			} else if (commande[2] == "compare") {
				exec(util.format(compare_cmd, o_escape(path.resolve(myIA.filename)), o_escape(path.resolve(filenameback))));
				console.log("Comparaison entre \"\033[36m" + myIA.filename + "\033[00m\" et \"\033[36m" + filenameback + "\033[00m\".");
			} else {
				console.log("Merci de préciser la sous-commande : .backup [id] {restore / open / compare.}");
			}
		} else {
			console.log("Le backup n'existe pas.");
		}
	} else if (commande[0] == ".forceupdate") {
		var id = parseInt(commande[1]),
			index = __AI_IDS.indexOf(id);

		if (index != -1) {
			sendScript(id, true);
			console.log("Mise à jour de l'IA n°\033[36m" + id + "\033[00m, \033[36m" + __AI_NAMES[index] + "\033[00m.");
		} else {
			showListIA();
		}
	} else if (commande[0] == ".open") {
		var id = parseInt(commande[1]),
			index = __AI_IDS.indexOf(id);

		if (index != -1) {
			var myIA = new __IA(id);
			open(myIA.filepath);
			console.log("Ouverture de l'IA n°\033[36m" + id + "\033[00m, \033[36m" + myIA.filename + "\033[00m.");
		} else {
			showListIA();
		}
	} else if (commande[0] == ".compare") {
		var ids = [parseInt(commande[1]), parseInt(commande[2])],
			index = [__AI_IDS.indexOf(ids[0]), __AI_IDS.indexOf(ids[1])];

		if (index[0] != -1 && index[1] != -1) {
			var myIAs = [new __IA(ids[0]), new __IA(ids[1])];
			exec(util.format(compare_cmd, o_escape(path.resolve(myIAs[0].filepath)), o_escape(path.resolve(myIAs[1].filepath))));

			console.log("Comparaison de l'IA n°\033[36m" + myIAs[0].id + "\033[00m et n°\033[36m" + myIAs[1].id + "\033[00m, \033[36m" + myIAs[0].name + "\033[00m et \033[36m" + myIAs[1].name + "\033[00m.");
		} else {
			showListIA();
		}
	} else if (commande[0] == ".rename") {
		var id = parseInt(commande[1]),
			index = __AI_IDS.indexOf(id);

		if (index != -1) {
			if (commande[2]) {
				$.post({
					url: "/index.php?page=editor_update",
					data: {
						color: 0,
						id: id,
						name: commande.slice(2).join(" "),
						save: true,
						token: __TOKEN,
					},
					success: function(res, data) {
						console.log("Le changement " + ((JSON.parse(data)) ? "a" : "\033[91mn'\033[00ma \033[91mpas\033[00m") + " été accepté par le serveur.");
					}
				});
			} else {
				console.log("C'est bien de vouloir renommer son IA, mais faut peut-être choisir un nouveau nom. - Après moi je dis ça... :B");
			}
		} else {
			showListIA();
		}
	} else if (commande[0] == ".workspace") {
		if (commande[1] == "make") {
			var name = commande.slice(2).join(" ");
			if (name == parseName(name) && !fs.existsSync(_WKfolder+name)) {
				fs.mkdirSync(_WKfolder+name);
			} else {
				if (!fs.existsSync(_WKfolder+name)) {
					console.log("Le nom est invalide (non autorisé : \/, \\, :, *, ?, \", <, >, &, |).");
				} else {
					console.log("Le dossier existe déjà dans le workspace.");
				}
			}
		} else if (commande[1] == "help") {
			console.log("Sous-commandes :");
			var lines = [
				["make [nom]", "Créer le workspace avoir le nom choisi"],
				["help", "Pour afficher cette aide"]
			];
			for (var i = 0; i < lines.length; i++) {
				console.log("\033[97m.workspace " + lines[i].join("\033[00m : ") + ".");
			}
		} else if (commande[1]) {
			console.log("Sous commande saisie inconnu.\n");
		} else {
			console.log("Pour afficher l'aide, utilisez \033[97m.workspace help\033[00m.");
		}
	} else if (["help", "?", ".help", "/?"].indexOf(commande[0]) != -1) {
		console.log("Aide :");
		var lines = [
			[".backup [id] {restore / open / compare}", "Gestion des backups"],
			[".forceupdate [id]", "Forcer l'envoie de l'IA"],
			[".open [id]", "Ouvre l'IA"],
			[".compare [id1] [id2]", "Compare deux fichiers"],
			[".rename [id] [name]", "Change le nom de l'IA"],
			[".workspace [option]", "Pour gérer les workspaces (plus d'aide \033[97m.workspace help\033[00m)"]
		];
		for (var i = 0; i < lines.length; i++) {
			console.log("\033[97m" + lines[i].join("\033[00m : ") + ".");
		}
		console.log("Autres :\n{ \033[97mtwitter / cfichat / forum / MP / leek / doc\033[00m }".replace(/ \/ /g, "\033[00m / \033[97m"));
		console.log("Astuces :");
		console.log("- Si on vous demande de taper \"\033[97m.backup [id]\033[00m\", essayez la flèche du haut.");
		console.log("- Essayez la touche tabulation lors de la saisie d'une commande.");
		console.log("- Modifier la variable compare_cmd ligne 21 pour pouvoir utiliser la fonction 'compare'.");
	} else if (commande[0] == "cfichat") {
		console.log("cfiChat : canal de discussion (HomeMade) - Programmation");
		open("http://chat.cfillion.tk/");
	} else {
		var C = false;
		switch (commande[0]) {
			case "twitter":
				C = open("https://twitter.com/GuimDev");
				break;
			case "forum":
				C = open("http://leekwars.com/forum/category-7/topic-221");
				break;
			case "MP":
				C = open("http://leekwars.com/farmer=265");
				break;
			case "leek":
				C = open("http://leekwars.com/");
				break;
			case "doc":
				C = open("http://leekwars.com/documentation");
				break;
			default:
				console.log("Inconnu regarde l'aide \".help\".");
		}
		if (C) {
			console.log("Page ouverte " + commande[0] + ".");
		}
	}
	console.log(" ");
}

function completerId(cmd, line, hits, verify) {
	var verify = (verify) ? verify : function(id, index) {
		return true;
	};

	var t = [cmd];
	if (line.indexOf(cmd) == 0) {
		__AI_IDS.forEach(function(id, index) {
			if (!verify(id, index)) {
				return;
			}
			t.push(cmd + id);
		});
		hits = t.filter(function(c) {
			return c.indexOf(line) == 0;
		});
		if (hits.length == 0) {
			hits = t;
		}
	}
	return hits;
}

function completerMore(line, hits) {
	if (hits.length == 1) {
		line = hits[0];
	}
	hits = completerId(".backup ", line, hits);
	hits = completerId(".forceupdate ", line, hits);
	hits = completerId(".open ", line, hits);
	hits = completerId(".compare ", line, hits);
	hits = completerId(".rename ", line, hits);

	return {
		line: line,
		hits: hits
	};
}

var __TAB_COMPLETIONS = [".help", ".backup ", ".forceupdate ", ".open ", ".compare ", ".rename ", ".workspace "].concat("twitter / cfichat / forum / MP / leek / doc ".split(" / "));

////--------------------------------------------------------------------------------
////--------------------------------------------------------------------------------
////--------------------------------------------------------------------------------

function saveHistory() {
	setFileContent(".temp/history", JSON.stringify(rl.history.slice(1, 20)));
}

function invasionB(b) {
	b = b ? true : false;
	if (b) {
		process.stdout.write("\x1Bc");
	}
	var a = [540608, 573488, 589836, 661698, 661698, 792769, 786433, 802785, 664098, 664514, 597004, 573488, 540608];

	var noNegative = function(value) {
		return value = (value < 0) ? 0 : value;
	};

	var stdout = process.stdout;
	var margin_y = (b) ? noNegative(Math.round((stdout.rows - a.length) / 2)) : 0;
	console.log(" " + Array(margin_y).join("\n"));
	for (var i = 0, value = 0; i < a.length; i++) {
		value = a[i].toString(2).substr(1);
		console.log(Array(noNegative(Math.round((stdout.columns - value.length) / 2))).join(" ") + value.replace(/0/g, " "));
	}
	console.log(" " + ((b) ? Array(noNegative(stdout.rows - a.length - margin_y - 3)).join("\n") : ""));
}
invasionB(0);

function sha256(data) {
	return crypto.createHash("sha256").update(data).digest("base64");
}

var __HIDDEN_PLAY = false;

function hidden(query, callback) {
	var stdin = process.openStdin(),
		i = 0;
	__HIDDEN_PLAY = true;
	process.stdin.on("data", function(char) {
		if (!__HIDDEN_PLAY) {
			return;
		}
		char = char + "";
		switch (char) {
			case "\u0003":
				process.exit();
				break;
			case "\n":
			case "\r":
			case "\u0004":
				__HIDDEN_PLAY = false;
				break;
			default:
				process.stdout.write("\033[2K\033[200D" + query + "[" + ((i % 2 == 1) ? "=-" : "-=") + "]");
				i++;
				break;
		}
	});

	rl.question(query, callback);
}

function get(option) {
	option.method = "GET";
	ajax(option);
}

function post(option) {
	option.method = "POST";
	ajax(option);
}

function ajax(option) {
	var data = (option.data) ? querystring.stringify(option.data) : "",
		context = (option.context) ? option.context : {};

	var options = {
		host: "leekwars.com",
		port: "80",
		path: option.url,
		method: (option.method == "GET") ? "GET" : "POST",
		headers: {
			"User-Agent": "NodeJS/1.0",
			"Content-Type": "application/x-www-form-urlencoded",
			"Content-Length": data.length,
			"Cookie": myCookie
		}
	};

	var req = http.request(options, function(res) {
		res.setEncoding('utf8');
		var content = "";

		res.on('data', function(chunk) {
			content += chunk;
		});

		res.on('end', function() {
			setFileContent(".temp/debug_print_r.js", print_r(res));
			if (option.success) {
				option.success(res, fixASCII(content), context);
			}
		});
	});

	req.on('error', function(e) {
		console.log('Erreur : ' + e.message);
	});

	req.write(data);
	req.end();
}

function dataCookieToString(dataCookie) {
	var t = "";
	for (var x = 0; x < dataCookie.length; x++) {
		t += ((t != "") ? "; " : "") + dataCookie[x].key + "=" + dataCookie[x].value;
	}
	return t;
}

function mkdataCookie(cookie) {
	var t, j;
	cookie = cookie.toString().replace(/,([^ ])/g, ",[12],$1").split(",[12],");
	for (var x = 0; x < cookie.length; x++) {
		cookie[x] = cookie[x].split("; ");
		j = cookie[x][0].split("=");
		t = {
			key: j[0],
			value: j[1]
		};
		for (var i = 1; i < cookie[x].length; i++) {
			j = cookie[x][i].split("=");
			t[j[0]] = j[1];
		}
		cookie[x] = t;
	}

	return cookie;
}

function print_r(obj) {
	var cache = [];
	return JSON.stringify(obj, function(key, value) {
		if (typeof value === 'object' && value !== null) {
			if (cache.indexOf(value) !== -1) {
				return;
			}
			cache.push(value);
		}
		return value;
	});
}

////--------------------------------------------------------------------------------
////----------------------------- // LICENCE CC BY-SA \\ ---------------------------
////-------------- Le code ci-dessous est partagé en licence CC BY-SA --------------
////------------- http://creativecommons.org/licenses/by-nc-sa/3.0/fr/  ------------
////------------------------------------------------------------ Par @GuimDev ------
////--------------------------------------------------------------------------------

console.log(">> Readline : Ok.");

rl.setPrompt("> ", 2);
rl.on("line", function(line) {
	useCommande(line);
	rl.prompt();
});
rl.on('close', function() {
	return invasionB(1) + process.exit(1);
});
rl.on("SIGINT", function() {
	rl.clearLine();
	rl.question("Es-tu sûr de vouloir éteindre le listener ? ", function(answer) {
		return (answer.match(/^o(ui)?$/i) || answer.match(/^y(es)?$/i)) ? saveHistory() + invasionB(1) + process.exit(1) : rl.output.write("> ");
	});
});
rl.prompt();

var fu = function(type, args) {
	var t = Math.ceil((rl.line.length + 3) / process.stdout.columns);
	var text = util.format.apply(console, args);
	rl.output.write("\n\x1B[" + t + "A\x1B[0J");
	rl.output.write(text + "\n");
	rl.output.write(Array(t).join("\n\x1B[E"));
	rl._refreshLine();
};

console.log = function() {
	fu("log", arguments);
};
console.warn = function() {
	fu("warn", arguments);
};
console.info = function() {
	fu("info", arguments);
};
console.error = function() {
	fu("error", arguments);
};

function completer(line) {
	var completions = __TAB_COMPLETIONS;
	var hits = completions.filter(function(c) {
		return c.indexOf(line) == 0;
	});
	var b = completerMore(line, hits),
		a = (line != b.line) ? [b.line] : [];

	hits = b.hits;
	if (hits.length == 1) {
		return [hits, line];
	} else {
		console.log("Suggestion :");
		var list = "",
			l = 0,
			c = "",
			t = hits.length ? hits : completions;
		for (var i = 0; i < t.length; i++) {
			c = t[i].replace(/(\s*)$/g, "")
			if (list != "") {
				list += ", ";
			}
			if (((list + c).length + 4 - l) > process.stdout.columns) {
				list += "\n";
				l = list.length;
			}
			list += c;
		}
		console.log(list + "\n");
		return [a, line];
	}
}

////--------------------------------------------------------------------------------
////-------------------------- Fin de la LICENCE CC BY-SA --------------------------
////--------------------------------------------------------------------------------
////--------------------------------------------------------------------------------

////--------------------------------------------------------------------------------
////---------- https://github.com/jjrdn/node-open/blob/master/lib/open.js ----------
////-------------------------------------------- Copyright (c) 2012 Jay Jordan -----
////--------------------------------------------------------------------------------

function open(target, appName, callback) {
	var opener;

	if (typeof(appName) === 'function') {
		callback = appName;
		appName = null;
	}

	switch (process.platform) {
		case 'darwin':
			if (appName) {
				opener = 'open -a "' + o_escape(appName) + '"';
			} else {
				opener = 'open';
			}
			break;
		case 'win32':
			if (appName) {
				opener = 'start "" "' + o_escape(appName) + '"';
			} else {
				opener = 'start ""';
			}
			break;
		default:
			if (appName) {
				opener = o_escape(appName);
			} else {
				opener = 'xdg-open';
			}
			break;
	}

	return exec(opener + ' "' + o_escape(target) + '"', callback);
}

function o_escape(s) {
	return s.replace(/"/, '\\\"');
}
