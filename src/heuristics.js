/** # Heuristics for Mancala

`Mancala.heuristics` is a bundle of helper functions to build heuristic evaluation functions for
this game.
*/
Mancala.heuristics = {
	/** + `heuristicFromWeights(weights=default weights)` builds an heuristic evaluation
		function from weights for each square in the board. The result of the function is the
		normalized weighted sum.
	*/
	fromWeights: function fromWeights(weights) {
		var weightSum = iterable(weights).map(Math.abs).sum();
		function __heuristic__(game, player) {
			var seedSum = 0, signum, result;
			switch (game.players.indexOf(player)) {
				case 0: signum = 1; break; // North.
				case 1: signum = -1; break; // South.
				default: throw new Error("Invalid player "+ player +".");
			}
			result = iterable(game.board).map(function (seeds, i) {
				seedSum += seeds;
				return seeds * weights[i]; //TODO Normalize weights before.
			}).sum() / weightSum / seedSum * signum;
			return result;
		}
		__heuristic__.weights = weights;
		return __heuristic__;
	}
};

/** The `DEFAULT` heuristic for Mancala is based on weights for each square. Stores are worth 5 and
houses 1, own possitive and the opponent's negative.
*/
Mancala.heuristics.DEFAULT = Mancala.heuristics.fromWeights(
	[+1,+1,+1,+1,+1,+1,+5, /**/ -1,-1,-1,-1,-1,-1,-5]
);
