namespace game {
	/** New System */
	export class DeathSystem extends ut.ComponentSystem {

		OnUpdate(): void {

			this.world.forEach([ut.Entity, Death, ut.Core2D.Sprite2DSequencePlayer, ut.Audio.AudioSource],
				(entity, death, animation, audio) => {
					if (!death.HasPlayed && !animation.paused && audio.playing) {
						death.HasPlayed = true;
						return;
					}

					if (death.HasPlayed && animation.paused && !audio.playing) {
						EntityUtils.DestroyEntity(this.world, death.Root, true);
					}
				});
		}
	}
}
