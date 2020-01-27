
namespace game {
	/** System to create a Faux3D effect of perspective by scaling an entity according to its Z-axis position */
	export class DepthRenderingSystem extends ut.ComponentSystem {

		OnUpdate(): void {
			this.world.forEach([ut.Entity, ut.Core2D.TransformLocalPosition, ut.Core2D.TransformLocalScale, DepthRenderer], (entity, position, scale, renderer) => {
				if (renderer.InitialScale.x == 0 || renderer.InitialScale.y == 0) {
					renderer.InitialScale = scale.scale;
				}

				let curve = this.world.getComponentData(renderer.ScaleDropOff, ut.Interpolation.BezierCurveFloat);
				let modifier = Math.max(curve.values[curve.values.length - 1], MathUtils.Lerp(curve.values[0], curve.values[curve.values.length - 1], Math.abs(position.position.z) / curve.times[curve.times.length - 1]));
				scale.scale = new Vector3(renderer.InitialScale.x * modifier, renderer.InitialScale.y * modifier, renderer.InitialScale.z);
			});
		}
	}
}
