namespace game {
	/** Utility class for various rotation related functions */
	export class RotationUtils {
		/** Sets the rotation of the given axes to a rotation in degrees
		 * 
		 * @param axis a Vector3 representation of the axes you want to rotate on (for example, if you only want to rotate on the Z axis, it would be new Vector3(0,0,1))
		 * @param degrees the amount of degrees to rotate over [Range -180 to 180]
		 */
		static SetRotationFromDegrees(world: ut.World, entity: ut.Entity, axis: Vector3, degrees: number) {
			if (!world.hasComponent(entity, ut.Core2D.TransformLocalRotation)) {
				console.error("Provided entity does not contain the ut.Core2D.TransformLocalRotation component.");
				return null;
			}

			let rot = world.getComponentData(entity, ut.Core2D.TransformLocalRotation);
			rot.rotation.setFromAxisAngle(axis, (degrees / 180) * Math.PI);
			world.setComponentData(entity, rot);
		}
	}
}