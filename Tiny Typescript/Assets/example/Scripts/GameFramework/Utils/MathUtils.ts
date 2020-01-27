namespace game {
	/** Utility class for general math functions */
	export class MathUtils {
		/** Calculates degrees between two coordinates
		 * [Range -179.999... - 180] */
		static CalculateDegrees(origin: Vector2, point: Vector2): number {
			let x = point.x - origin.x;
			let y = point.y - origin.y;
			return (Math.atan2(y, x) * 180) / Math.PI;
		}

		static CalculateDistance(origin: Vector2, point: Vector2): number {
			let x = point.x - origin.x;
			let y = point.y - origin.y;
			let vector = new Vector2(x, y);
			return vector.length();
		}

		/** Returns a rounded number within specified range
		 *
		 * @param max The limit of the range (inclusive)
		 * @param min [OPTIONAL] the lower limit of the range (inclusive); defaults to 0
		 */
		static RandomRangeRounded(max: number, min = 0) {
			return Math.round(min + Math.random() * max);
		}

		/**
		 * Rounds the provided value to the provided amount of decimals.
		 * @param value The value which will be rounded.
		 * @param decimalAmount The amount of decimals the provided value will be rounded to.
		 */
		static RoundOnDecimals(value: number, decimalAmount: number): number {
			let decimalMultiplier = Math.pow(10, decimalAmount);
			return Math.round(value * decimalMultiplier) / decimalMultiplier;
		}

		/** Clamps a value in between a minimum and maximum value
		 *
		 * @param value the value to evaluate
		 * @param minmax the Vector2 storing the minimum value (x) and the maximum value (y)
		 */
		static ClampValueMinMax(value: number, minmax: Vector2): number {
			return Math.max(Math.min(value, minmax.y), minmax.x);
		}

		/** Determines whether the given value is between the minimum and maximum values of provided MinMax Vector2
		 *
		 * @param value the value to evaluate
		 * @param minmax the Vector2 storing the minimum value (x) and the maximum value (y)
		 */
		static IsInMinMax(value: number, minmax: Vector2): boolean {
			if (minmax.x <= value && value <= minmax.y) {
				return true;
			}
			return false;
		}

		/** Returns a random value inbetween the minimum and maximum of provided MinMax Vector2 */
		static GetRandomMinMax(minmax: Vector2): number {
			return minmax.x + Math.random() * Math.abs(minmax.y - minmax.x);
		}

		/** Calculates a vector3 from a local direction and a rotation.
		 *
		 * @param direction the direction relative to local origin
		 * @param rotation the local rotation
		 */
		static CalculateRodriguesFormula(direction: Vector3, rotation: Quaternion): Vector3 {
			const ax = rotation.y * direction.z - rotation.z * direction.y + rotation.w * direction.x;
			const ay = rotation.z * direction.x - rotation.x * direction.z + rotation.w * direction.y;
			const az = rotation.x * direction.y - rotation.y * direction.x + rotation.w * direction.z;
			const tx = rotation.x + rotation.x;
			const ty = rotation.y + rotation.y;
			const tz = rotation.z + rotation.z;
			return new Vector3(ty * az - tz * ay + direction.x, tz * ax - tx * az + direction.y, tx * ay - ty * ax + direction.z);
		}

		/** Linear interpolation between two values with the given progress.
		 *
		 * @param progress the progress of changing the fromValue to the toValue, range [0...1]
		 */
		static Lerp(fromValue: number, toValue: number, progress: number): number {
			return MathUtils.ClampValueMinMax(fromValue + progress * (toValue - fromValue),
				new Vector2(Math.min(fromValue, toValue), Math.max(fromValue, toValue)));
		}
	}
}
