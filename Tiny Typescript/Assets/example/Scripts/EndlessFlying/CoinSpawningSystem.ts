namespace game {
	/** New System */
	export class CoinSpawningSystem extends ut.ComponentSystem {

		OnUpdate(): void {

			this.world.forEach([CoinSpawner, TimeInterval], (spawner, timer) => {
				if (timer.Time < timer.Interval || !spawner.CanSpawn) { return; }
				timer.Time = 0;

				if (spawner.CurrentXOffset >= spawner.CoinsPerRow) {
					if (spawner.CurrentXOffset >= (spawner.CoinsPerRow + spawner.RowOffset)) {
						spawner.CurrentXOffset = 0;
					} else {
						spawner.CurrentXOffset += 1;
						return;
					}
				}

				if (spawner.CurrentXOffset === 0) {
					spawner.CurrentYOffset = Math.round(MathUtils.GetRandomMinMax(spawner.SpawnLocationMinMaxY));
				}

				let newCoin = ut.EntityGroup.instantiate(this.world, spawner.CoinEntityGroup)[0];
				this.world.usingComponentData(newCoin, [ut.Core2D.TransformLocalPosition], transform => {
					let random = Math.random();
					let modifier = 0;
					if (random <= 0.33) {
						modifier = spawner.VerticalOffset;
					} else if (random <= 0.66) {
						modifier = -1 * spawner.VerticalOffset;
					}
					spawner.CurrentYOffset = MathUtils.ClampValueMinMax(spawner.CurrentYOffset + modifier, spawner.SpawnLocationMinMaxY);
					transform.position = new Vector3(spawner.SpawnLocationX, spawner.CurrentYOffset, transform.position.z);
				});

				spawner.CurrentXOffset += 1;
			})
		}
	}
}
