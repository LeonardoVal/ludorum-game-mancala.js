// This is a copy fo similar test cases used in ludorum.
define(['creatartis-base', 'sermat', 'ludorum', 'ludorum-game-mancala'], function (base, Sermat, ludorum, ludorum_game_mancala) {
	var RANDOM = base.Randomness.DEFAULT;

	// Test functions //////////////////////////////////////////////////////////////////////////////

	function itIsGameInstance(game) {
		it("is a valid instance of ludorum.Game", function () {
			expect(game).toBeOfType(ludorum.Game);
			expect(game.name).toBeTruthy();
			expect(game.players).toBeOfType(Array);
			expect(game.players.length).toBeGreaterThan(0);
			var serialized = Sermat.ser(game);
			expect(serialized).toBeOfType('string');
			expect(Sermat.mat(serialized)).toBeOfType(game.constructor);
		});
	}

	function checkFinishedGame(game, options) {
		expect(game.moves()).toBeFalsy();
		var sum = 0, result = game.result();
		expect(result).toBeTruthy();
		game.players.forEach(function (player) {
			expect(result[player]).toBeOfType('number');
			sum += result[player];
		});
		if (options && options.zeroSum) {
			expect(sum).toBe(0);
		}
	}

	function checkUnfinishedGame(game, options) {
		var moves = game.moves();
		expect(moves).toBeTruthy();
		expect(game.activePlayers).toBeOfType(Array);
		if (options && options.oneActivePlayerPerTurn) {
			expect(game.activePlayers.length).toBe(1);
		}
		if (game.activePlayers.length === 1) {
			expect(game.activePlayer()).toBe(game.activePlayers[0]);
		} else {
			expect(game.activePlayer.bind(game)).toThrow();
		}
		game.activePlayers.forEach(function (activePlayer) {
			expect(game.isActive(activePlayer)).toBe(true);
			expect(moves[activePlayer]).toBeOfType(Array);
			expect(moves[activePlayer].length).toBeGreaterThan(0);
		});
	}

	function itWorksLikeGame(game, options) {
		it("works like a game", function () {
			var MAX_PLIES = 500, moves, decisions;
			for (var i = 0; i < MAX_PLIES; i++) {
				while (game && game instanceof ludorum.Contingent) {
					game = game.randomNext();
				}
				expect(game).toBeOfType(ludorum.Game);
				moves = game.moves();
				if (!moves) {
					checkFinishedGame(game, options);
					break;
				} else {
					checkUnfinishedGame(game, options);
					decisions = {};
					game.activePlayers.forEach(function (activePlayer) {
						decisions[activePlayer] = RANDOM.choice(moves[activePlayer]);
					});
					game = game.next(decisions);
				}
			}
			if (i >= MAX_PLIES) {
				throw new Error('Match of game '+ game.name +' did not end after '+
					MAX_PLIES +' plies (final state: '+ game +')!');
			}
		});
	}

	// Actual tests ////////////////////////////////////////////////////////////////////////////////

	describe("games.Mancala", function () {
		var game = new ludorum_game_mancala.Mancala(),
			options = { zeroSum: true, oneActivePlayerPerTurn: true };
		itIsGameInstance(game, options);
		itWorksLikeGame(game, options);
	});
}); //// define.
