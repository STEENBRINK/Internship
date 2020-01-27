
namespace game {

	/** New System */
	export class SpawningSystem extends ut.ComponentSystem {

		OnUpdate(): void {
			this.world.forEach([ut.Entity, Spawner], (entity, spawner) => {
				if (spawner.SpawnMode == SpawnMode.MANUAL) {
					if (!spawner.CanSpawn) {
						//Not allowed to spawn
						return;
					}
					spawner.CanSpawn = false;
				}
				if (spawner.SpawnMode == SpawnMode.TIMEINTERVAL) {
					let interval = this.world.getComponentData(entity, TimeInterval);
					if (interval.Time < interval.Interval) {
						//Can't spawn yet
						return;
					}
					TimeUtils.ResetTime(this.world, entity);
				}

				let spawnGroupName = ArrayUtils.GetRandomElement(spawner.Prefab);
				let newEntity = ut.EntityGroup.instantiate(this.world, spawnGroupName)[0];
				this.world.usingComponentData(newEntity, [ut.Core2D.TransformLocalPosition], (position) => {
					let x = MathUtils.GetRandomMinMax(spawner.SpawnPositionMinMaxX);
					let y = MathUtils.GetRandomMinMax(spawner.SpawnPositionMinMaxY);
					position.position = new Vector3(x, y, position.position.z);
				});
			});
		}
	}
}