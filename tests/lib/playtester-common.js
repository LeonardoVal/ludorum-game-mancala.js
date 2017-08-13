/** This is a bundle of common definitions and functions used by playtesters.
*/
define(['ludorum', 'creatartis-base', 'sermat'], function (ludorum, base, Sermat) {
	var escapeXML = base.Text.escapeXML.bind(base.Text);

	function domElemOrId(elem) {
		return (typeof elem === 'string') ? document.getElementById(elem) : elem;
	}

	var PlayTesterApp = base.declare({
		constructor: function PlayTesterApp(game, ui, elements, webWorkerDependencies) {
			this.game = game;
			this.ui = ui;
			this.elements = base.iterable(elements).mapApply(function (id, elem) {
				return [id, domElemOrId(elem)];
			}).toObject();
			this.players = [];
			this.currentPlayers = [];
			this.webWorkerDependencies = webWorkerDependencies || [];
		},

		player: function addPlayer(title, builder, runOnWorker) {
			this.players.push({title: title, builder: builder, runOnWorker: runOnWorker });
			return this; // for chaining.
		},

		playerUI: function playerUI(title, runOnWorker) {
			this.player(title || "UI", function () {
				return new ludorum.players.UserInterfacePlayer();
			}, !!runOnWorker);
			return this; // for chaining.
		},

		playerRandom: function playerRandom(title, runOnWorker) {
			this.player(title || "Random", function () {
				return new ludorum.players.RandomPlayer();
			}, !!runOnWorker);
			return this; // for chaining.
		},

		playerMonteCarlo: function playerMonteCarlo(title, runOnWorker, simulationCount, timeCap) {
			title = title || "MonteCarlo ("
				+ (timeCap ? timeCap / 1000 +" sec" : simulationCount +" sims")
				+")";
			this.player(title,
				new Function('return new ludorum.players.MonteCarloPlayer({'
					+'simulationCount:'+ simulationCount +','
					+'timeCap:'+ timeCap +'});'),
				!!runOnWorker);
			return this; // for chaining.
		},

		playerUCT: function playerUCT(title, runOnWorker, simulationCount, timeCap) {
			title = title || "UCT ("
				+ (timeCap ? timeCap / 1000 +" sec" : simulationCount +" sims")
				+")";
			this.player(title,
				new Function('return new ludorum.players.UCTPlayer({'
					+'simulationCount:'+ simulationCount +','
					+'timeCap:'+ timeCap +'});'),
				!!runOnWorker);
			return this; // for chaining.
		},

		playerAlfaBeta: function playerAlfaBeta(title, runOnWorker, horizon, heuristic) {
			this.player(title || "AlfaBeta (h="+ horizon +")",
				new Function('return new ludorum.players.AlphaBetaPlayer({'
					+'horizon:'+ horizon +','
					+'heuristic:'+ heuristic +'});'),
				!!runOnWorker);
			return this; // for chaining.
		},

		playerMaxN: function playerMaxN(title, runOnWorker, horizon) {
			this.player(title || "MaxN (h="+ horizon +")",
				new Function('return new ludorum.players.MaxNPlayer({'
					+'horizon: '+ horizon +'});'),
				!!runOnWorker);
			return this; // for chaining.
		},

		selects: function selects(selectElems) {
			selectElems = selectElems ? selectElems.map(domElemOrId) : document.getElementsByTagName('select');
			this.elements.selects = selectElems;
			var app = this,
				selectOnChange = function (playerNum) {
					var option = app.players[+this.value];
					(option.runOnWorker
						? ludorum.players.WebWorkerPlayer.create({
							playerBuilder: option.builder,
							dependencies: app.webWorkerDependencies
						})
						: base.Future.when(option.builder())
					).then(function (player) {
						app.currentPlayers[playerNum] = player;
						app.reset();
					});
				},
				optionsHTML = base.iterable(this.players).map(function (option, i) {
					return '<option value="'+ i +'">'+ option.title +'</option>';
				}).join('');
			selectElems.forEach(function (select, i) {
				select.innerHTML = optionsHTML;
				select.onchange = selectOnChange.bind(select, i);
			});
			var defaultBuilder = app.players[0].builder;
			this.currentPlayers = selectElems.map(function () {
				return defaultBuilder();
			});
			return this; // for chaining.
		},

		button: function button(name, elem, onclick) {
			this.elements[name] = elem;
			elem.onclick = onclick;
			return this;
		},

		reset: function reset() {
			var match = new ludorum.Match(this.game.clone(), this.currentPlayers);
			this.currentMatch = match;
			this.ui.show(match);
			var bar = this.elements.bar;
			if (bar) {
				match.events.on('begin', function (game) {
					bar.innerHTML = escapeXML("Turn "+ game.activePlayer() +".");
				});
				match.events.on('next', function (game, next) {
					bar.innerHTML = escapeXML("Turn "+ next.activePlayer() +".");
				});
				match.events.on('end', function (game, results) {
					var winner = game.players.filter(function (p) {
						return results[p] > 0;
					});
					bar.innerHTML = escapeXML(winner.length < 1 ? 'Drawed game.' : winner[0] +' wins.');
				});
			}
			match.run();
			return this; // for chaining.
		}
	});

	return PlayTesterApp;
}); // define
