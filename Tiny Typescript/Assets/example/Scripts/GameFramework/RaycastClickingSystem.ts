
namespace game {

	/** System that adds all clicked entities to the RaycastEntityHitStorage */
	export class RaycastClickingSystem extends ut.ComponentSystem {

		OnUpdate(): void {
			this.world.forEach([RaycastEntityHitStorage, Clicker], (storage, clicker) => {
				if (clicker.Paused || clicker.Presses.length <= 0 || clicker.Points.length <= 0) {
					return;
				}

				let mousePos = clicker.Points[clicker.Points.length - 1];
				let hit = ut.HitBox2D.HitBox2DService.hitTest(this.world, new Vector3(mousePos.x, mousePos.y, 10), clicker.Camera);
				if (!hit.entityHit.isNone() && !EntityUtils.ExistsIn(hit.entityHit, storage.Hits)) {
					storage.Hits = ArrayUtils.AddToArray(storage.Hits, hit.entityHit);
				}
			});
		}
	}
}
