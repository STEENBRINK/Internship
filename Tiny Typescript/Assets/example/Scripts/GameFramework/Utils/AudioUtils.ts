namespace game {
	/** Utility class for various audio functions */
	export class AudioUtils {
		/** Starts playing the audioSource on the provided entity. 
		 * 
		 * @param useReferenceEntity if true, a new entity will be used or created in a separate scene to play the audio
		*/
		static StartAudio(world: ut.World, entity: ut.Entity, useReferenceEntity: boolean, autoDestroyReference?: boolean) {
			if (!world.hasComponent(entity, ut.Audio.AudioSource)) {
				console.error("Provided entity does not contain the ut.Audio.AudioSource component.");
				return null;
			}

			//Regular audioStart when no referenceEntity is needed
			if (!useReferenceEntity) {
				world.addComponent(entity, ut.Audio.AudioSourceStart);
				return;
			}

			// No new entity when one already exists
			if (world.hasComponent(entity, AudioSourceReference)) {
				this.RestartAudio(world, entity);
				return;
			}

			//Create new audioEntity and copy audioSource data
			let audioEntity = ut.EntityGroup.instantiate(world, Global.AUDIO_SCENE)[0];
			world.setOrAddComponentData(audioEntity, world.getComponentData(entity, ut.Audio.AudioSource));
			world.addComponent(audioEntity, ut.Audio.AudioSourceStart);
			if (autoDestroyReference) { world.addComponent(audioEntity, AudioAutoDestroy); }

			//Reference new audioEntity to original entity
			let ref = world.getOrAddComponentData(entity, AudioSourceReference);
			ref.AudioEntity = audioEntity;
			world.setComponentData(entity, ref);
		}

		/** Restarts the clip of the audioSource, if it is playing. */
		static RestartAudio(world: ut.World, entity: ut.Entity) {
			if (world.hasComponent(entity, ut.Audio.AudioSourceStart)) { return; }

			if (world.hasComponent(entity, AudioSourceReference)) {
				let ref = world.getComponentData(entity, AudioSourceReference).AudioEntity;
				world.addComponent(ref, ut.Audio.AudioSourceStart);
			} else {
				world.addComponent(entity, ut.Audio.AudioSourceStart);
			}
		}

		/** Stops playing the audioSource on the provided entity. */
		static StopAudio(world: ut.World, entity: ut.Entity) {
			if (world.hasComponent(entity, ut.Audio.AudioSourceStop)) { return; }

			if (world.hasComponent(entity, AudioSourceReference)) {
				let ref = world.getComponentData(entity, AudioSourceReference).AudioEntity;
				world.addComponent(ref, ut.Audio.AudioSourceStop);
			} else {
				world.addComponent(entity, ut.Audio.AudioSourceStop);
			}
		}

		/**
		 * Sets the clip of the provided entity's AudioSource (or it's reference's)
		 * @param entity the entity containing the AudioSource component or a reference to an entity that does
		 * @param clip the audioClip to set to the AudioSource component
		 */
		static SetAudioSourceClip(world: ut.World, entity: ut.Entity, clip: ut.Entity) {
			//Get Reference if exists, else take original source
			if (world.hasComponent(entity, AudioSourceReference)) {
				let ref = world.getComponentData(entity, AudioSourceReference).AudioEntity;

				let source = world.getComponentData(ref, ut.Audio.AudioSource);
				source.clip = clip;
				world.setComponentData(ref, source);
			} else if (world.hasComponent(entity, ut.Audio.AudioSource)) {
				let source = world.getComponentData(entity, ut.Audio.AudioSource);
				source.clip = clip;
				world.setComponentData(entity, source);
			} else {
				console.error("Provided entity does not contain the ut.Audio.AudioSource component.");
			}
		}

		/** Pauses or resumes all audio in the world. */
		static PauseAllAudio(world: ut.World, paused: boolean) {
			let config = world.getConfigData(ut.Audio.AudioConfig);
			config.paused = paused;
			world.setConfigData(config);
		}

		static PauseAllMusic(world: ut.World, paused: boolean) {
			world.forEach([ut.Entity, ut.Audio.AudioSource, AudioType], (entity, source, type) => {
				if (type.Type == AudioSourceType.SOUNDEFFECT) { return; }
				let name = world.getEntityName(entity);
				paused ? AudioUtils.StopAudio(world, entity) : AudioUtils.RestartAudio(world, entity);
			});
		}

		static PauseAllSoundEffects(world: ut.World, paused: boolean) {
			world.forEach([ut.Entity, ut.Audio.AudioSource, AudioType], (entity, source, type) => {
				if (type.Type == AudioSourceType.MUSIC) { return; }
				paused ? AudioUtils.StopAudio(world, entity) : AudioUtils.RestartAudio(world, entity);
			});
		}

		/** Returns wether or not all audio is paused. */
		static IsPaused(world: ut.World): boolean {
			return world.getConfigData(ut.Audio.AudioConfig).paused;
		}

		/** Returns a random AudioClipEntity from the provided AudioClipHolder component */
		static GetRandomClip(holder: AudioClipHolder): ut.Entity {
			return ArrayUtils.GetRandomElement<ut.Entity>(holder.Clips);
		}
	}
}
