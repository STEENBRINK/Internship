namespace game {
	/** Utility class for various color functions */
	export class ColorUtils {
		/** Returns the result of combining the first color with the second color as overlay. */
		static AddColor(color: ut.Core2D.Color, newColor: ut.Core2D.Color): ut.Core2D.Color {
			return new ut.Core2D.Color(
				Math.max(0, color.r - (1 - newColor.r)),
				Math.max(0, color.g - (1 - newColor.g)),
				Math.max(0, color.b - (1 - newColor.b)),
				Math.max(0, color.a - (1 - newColor.a))
			);
		}

		/** Returns the interpolated color between the fromColor and the toColor based on the provided progress
		 * 
		 * @param progress the progress of changing the fromColor to the toColor, range [0...1]
		 */
		static Lerp(fromColor: ut.Core2D.Color, toColor: ut.Core2D.Color, progress: number): ut.Core2D.Color {
			return new ut.Core2D.Color(
				MathUtils.Lerp(fromColor.r, toColor.r, progress),
				MathUtils.Lerp(fromColor.g, toColor.g, progress),
				MathUtils.Lerp(fromColor.b, toColor.b, progress),
				MathUtils.Lerp(fromColor.a, toColor.a, progress)
			);
		}
	}
}