namespace game {
	/** System to handle the GameOverState */
	export class GameOverSystem extends ut.ComponentSystem {

		OnUpdate(): void {
			this.world.forEach([GameOverManager, TimeInterval], (gameOver, timer) => {
				//Wait a bit before showing the GameOver screen, player can see himself explode
				if (timer.Interval === -1) { timer.Interval = gameOver.TimeBefore; }

				//Activate GameOver screen
				else if (timer.Interval === gameOver.TimeBefore && timer.Time >= timer.Interval) {
					timer.Interval = gameOver.GameOverDuration;
					gameOver.GameOverEntities.forEach(entity => { EntityUtils.SetActive(this.world, entity, true); });
				}

				//Wrap up game
				else if (timer.Interval === gameOver.GameOverDuration && timer.Time >= timer.Interval) {
					//Set score
					PlayerUtils.SetScore(this.world, gameOver.FinalScore);

					//Restart game
					ut.EntityGroup.destroyAll(this.world, "game.game");
					ut.EntityGroup.destroyAll(this.world, "game.Enemy0");
					ut.EntityGroup.destroyAll(this.world, "game.Enemy1");
					ut.EntityGroup.destroyAll(this.world, "game.Enemy2");
					ut.EntityGroup.destroyAll(this.world, "game.Coin");
					ut.EntityGroup.destroyAll(this.world, "game.Shield");
					ut.EntityGroup.instantiate(this.world, "game.game");
				}
			});
		}
	}
}
