namespace game {
	/** New System */
	export class AudioAutoDestroySystem extends ut.ComponentSystem {
		OnUpdate(): void {
			this.world.forEach([ut.Entity, ut.Audio.AudioSource, AudioAutoDestroy], (entity, source, audioStop) => {
				if (!audioStop.HasPlayed && source.playing) {
					audioStop.HasPlayed = true;
					return;
				}

				if (audioStop.HasPlayed && !source.playing) {
					EntityUtils.DestroyEntity(this.world, entity, true);
				}
			});
		}
	}
}
