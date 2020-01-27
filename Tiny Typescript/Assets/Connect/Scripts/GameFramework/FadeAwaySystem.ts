
namespace game {

	/** System to handle fading of entities */
	export class FadeAwaySystem extends ut.ComponentSystem {

		OnUpdate(): void {

			//••• FADE AWAY •••
			//• Image
			this.world.forEach([ut.Entity, ut.Core2D.TransformNode, FadeAway, TimeInterval, ut.Core2D.Sprite2DRenderer], (entity, transform, fader, timer, renderer) => {
				//Initialisation
				if (fader.InitialAlpha === -1) { fader.InitialAlpha = renderer.color.a; }

				let progress = MathUtils.ClampValueMinMax(timer.Time / timer.Interval, new Vector2(0, 1));
				let newAlpha = MathUtils.Lerp(fader.InitialAlpha, 0, progress);
				renderer.color = new ut.Core2D.Color(renderer.color.r, renderer.color.g, renderer.color.b, newAlpha);
				if (timer.Time >= timer.Interval && fader.DestroyAfterFade) {
					EntityUtils.DestroyEntity(this.world, entity, true);
				}
			});

			//• Text
			this.world.forEach([ut.Entity, ut.Core2D.TransformNode, FadeAway, TimeInterval, ut.Text.Text2DStyle], (entity, transform, fader, timer, renderer) => {
				//Initialisation
				if (fader.InitialAlpha === -1) { fader.InitialAlpha = renderer.color.a; }

				let progress = MathUtils.ClampValueMinMax(timer.Time / timer.Interval, new Vector2(0, 1));
				let newAlpha = MathUtils.Lerp(fader.InitialAlpha, 0, progress);
				renderer.color = new ut.Core2D.Color(renderer.color.r, renderer.color.g, renderer.color.b, newAlpha);
				if (timer.Time >= timer.Interval && fader.DestroyAfterFade) {
					EntityUtils.DestroyEntity(this.world, entity, true);
				}
			});

			//••• FADE IN •••
			//• Image
			this.world.forEach([ut.Entity, ut.Core2D.TransformNode, FadeIn, TimeInterval, ut.Core2D.Sprite2DRenderer], (entity, transform, fader, timer, renderer) => {
				//Initialisation
				if (fader.EndAlpha > 1) { fader.EndAlpha = fader.EndAlpha / 255; }

				let progress = MathUtils.ClampValueMinMax(timer.Time / timer.Interval, new Vector2(0, 1));
				let newAlpha = MathUtils.Lerp(0, fader.EndAlpha, progress);
				renderer.color = new ut.Core2D.Color(renderer.color.r, renderer.color.g, renderer.color.b, newAlpha);
				if (timer.Time >= timer.Interval && fader.RemoveComponentAfterFade) {
					this.world.removeComponent(entity, FadeIn);
				}
			});

			//• Text
			this.world.forEach([ut.Entity, ut.Core2D.TransformNode, FadeIn, TimeInterval, ut.Text.Text2DStyle], (entity, transform, fader, timer, renderer) => {
				//Initialisation
				if (fader.EndAlpha > 1) { fader.EndAlpha = fader.EndAlpha / 255; }

				let progress = MathUtils.ClampValueMinMax(timer.Time / timer.Interval, new Vector2(0, 1));
				let newAlpha = MathUtils.Lerp(0, fader.EndAlpha, progress);
				renderer.color = new ut.Core2D.Color(renderer.color.r, renderer.color.g, renderer.color.b, newAlpha);
				if (timer.Time >= timer.Interval && fader.RemoveComponentAfterFade) {
					this.world.removeComponent(entity, FadeIn);
				}
			});
		}
	}
}
