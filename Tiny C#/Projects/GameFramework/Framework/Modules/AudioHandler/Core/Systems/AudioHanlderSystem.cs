using Unity.Authoring.Core;
using Unity.Collections;
using Unity.Entities;
using Unity.Tiny.Scenes;
using UnityEngine;

namespace Modules.AudioHandler.Core
{
    public class AudioHanlderSystem : ComponentSystem
    {
        private static readonly Scene _audioScene = new Scene();
        private static NativeArray<Entity> _stopAllAudioArray;
        private static Entity _configuration;
        public static bool isConfigSet = false;
        public static bool isInit = false;
        
        /// <summary>
        /// Checks for the AudioSources Buffer component, if found sets all the audio sources.
        /// Checks for StartAudio and StopAudio components and handles them if no StopAllAudio component is found
        /// Checks for SetAudioClip components and handles them
        /// </summary>
        /// <exception cref="MultipleAudioSourcesComponentsFoundException">When multiple audiosources components are added</exception>
        protected override void OnUpdate()
        {
            _stopAllAudioArray = GetEntityQuery(typeof(StopAllAudio)).ToEntityArray(Allocator.Temp);
            if (!isConfigSet)
            {
                isConfigSet = true;
                _configuration = GetEntityQuery(typeof(ConfigurationTag)).GetSingletonEntity();
            }
            
            NativeArray<Entity> audioSourcesArray = GetEntityQuery(typeof(AudioSources)).ToEntityArray(Allocator.Temp);
            NativeArray<Entity> audioInitializedArray = GetEntityQuery(typeof(AudioID)).ToEntityArray(Allocator.Temp);
            if (audioSourcesArray.Length == 0)
            {
                //do nothing
            }
            else if (audioSourcesArray.Length > 1)
            {
                throw new MultipleAudioSourcesComponentsFoundException();
            }
            else 
            {
                if (audioInitializedArray.Length == 0)
                {
                    NativeArray<AudioSources> audioSources = EntityManager.GetBuffer<AudioSources>(audioSourcesArray[0]).ToNativeArray(Allocator.Temp);
                    
                    for (var i = 0; i < audioSources.Length; i++)
                    {
                        var tempEntity = EntityManager.CreateEntity(typeof(AudioID), typeof(Unity.Tiny.Audio.AudioSource));
                        _audioScene.AddEntityReference(EntityManager, tempEntity);
                        var audioComponent = EntityManager.GetComponentData<Unity.Tiny.Audio.AudioSource>(tempEntity);
                        var idComponent = EntityManager.GetComponentData<AudioID>(tempEntity);
                        Debug.Log(audioSources[i].clip.ToString());
                        audioComponent.clip = audioSources[i].clip;
                        audioComponent.volume = audioSources[i].volume;
                        audioComponent.loop = audioSources[i].loop;
                        idComponent.ID = (uint) i;
                        idComponent.shouldAllWaysPlay = audioSources[i].shouldAllwaysPlay;
                        if (audioSources[i].shouldAllwaysPlay)
                        {
                            Debug.Log("Adding audiostart");
                            EntityManager.AddComponent(tempEntity, typeof(Unity.Tiny.Audio.AudioSourceStart));
                        }
                        EntityManager.SetComponentData(tempEntity, audioComponent);
                        EntityManager.SetComponentData(tempEntity, idComponent);
                        isInit = true;
                    }
                    audioSources.Dispose();
                }
                else
                {
                    NativeArray<Entity> audioStartArray = GetEntityQuery(typeof(StartAudio)).ToEntityArray(Allocator.Temp);
                    NativeArray<Entity> audioStopArray = GetEntityQuery(typeof(StopAudio)).ToEntityArray(Allocator.Temp);
                    bool stopAllAudio = _stopAllAudioArray.Length > 0;
                    foreach (var entity in audioInitializedArray)
                    {
                        var audioSource = EntityManager.GetComponentData<Unity.Tiny.Audio.AudioSource>(entity);
                        if (stopAllAudio)
                        {
                            if (audioSource.isPlaying)
                            {
                                EntityManager.AddComponent(entity, typeof(Unity.Tiny.Audio.AudioSourceStop));
                            }
                        }
                        else
                        {
                            var audioID = EntityManager.GetComponentData<AudioID>(entity);
                            foreach (var audioStartEntity in audioStartArray)
                            {
                                Debug.Log("Starting: " + audioID.ID);
                                var audioStart = EntityManager.GetComponentData<StartAudio>(audioStartEntity);
                                if (audioStart.ID != audioID.ID) continue;
                                EntityManager.AddComponent(entity, typeof(Unity.Tiny.Audio.AudioSourceStart));
                                EntityManager.RemoveComponent<StartAudio>(audioStartEntity);
                            }

                            foreach (var audioStopEntity in audioStopArray)
                            {
                                var audioStop = EntityManager.GetComponentData<StartAudio>(audioStopEntity);
                                if (audioStop.ID != audioID.ID) continue;
                                EntityManager.AddComponent(entity, typeof(Unity.Tiny.Audio.AudioSourceStop));
                                EntityManager.RemoveComponent<StartAudio>(audioStopEntity);
                            }
                            
                            if (audioID.shouldAllWaysPlay && !audioSource.isPlaying)
                            {
                                EntityManager.AddComponent(entity, typeof(Unity.Tiny.Audio.AudioSourceStart));
                            }
                        }
                    }
                    audioStartArray.Dispose();
                    audioStopArray.Dispose();
                }
            }

            if (isInit)
            {
                Entities.ForEach((Entity e, ref SetAudioClip audioClip) =>
                {
                    SetAudioClip currentAudioClip = audioClip;
                    Entities.ForEach((ref AudioID audioID, ref Unity.Tiny.Audio.AudioSource audioSourceX) =>
                    {
                        if (audioID.ID != currentAudioClip.ID) return;
                        audioSourceX.clip = currentAudioClip.clip;
                        audioSourceX.volume = currentAudioClip.volume;
                    });
                });
            }
        }

        
        /// <summary>
        /// Starts a certain audio clip
        /// </summary>
        /// <param name="ID">The index of the audio clip in the AudioSources list</param>
        /// <param name="entityManager">The EntityManager instance</param>
        public static void StartAudio(uint ID, EntityManager entityManager)
        {
            entityManager.AddComponent(_configuration, typeof(StartAudio));
            var data = entityManager.GetComponentData<StartAudio>(_configuration);
            data.ID = ID;
            entityManager.SetComponentData(_configuration, data);
        }
        
        /// <summary>
        /// Stops a certain audio clip
        /// </summary>
        /// <param name="ID">The index of the audio clip in the AudioSources list</param>
        /// <param name="entityManager">The EntityManager instance</param>
        public static void StopAudio(uint ID, EntityManager entityManager)
        {
            entityManager.AddComponent(_configuration, typeof(StopAudio));
            var data = entityManager.GetComponentData<StopAudio>(_configuration);
            data.ID = ID;
            entityManager.SetComponentData(_configuration, data);
        }

        
        /// <summary>
        /// Stops all the audio
        /// </summary>
        /// <param name="entityManager">The EntityManager instance</param>
        public static void StopAllAudio(EntityManager entityManager)
        {
            entityManager.AddComponent(_configuration, typeof(StopAllAudio));
        }
        
        
        /// <summary>
        /// resumes all the audio if stopped
        /// </summary>
        /// <param name="entityManager">The EntityManager instance</param>
        public static void ResumeAllAudio(EntityManager entityManager)
        {
            foreach (var entity in _stopAllAudioArray)
            {
                entityManager.RemoveComponent<StopAllAudio>(entity);
            }
        }

        /// <summary>
        /// Replaces one audio clip for another
        /// </summary>
        /// <param name="audioClip">The audioclip</param>
        /// <param name="volume">The volume the clip should be played at</param>
        /// <param name="ID">The index of the audio clip in the AudioSources list</param>
        /// <param name="entityManager">The EntityManager instance</param>
        public static void SetAudioClip(Entity audioClip, float volume, uint ID, EntityManager entityManager)
        {
            entityManager.AddComponent(_configuration, typeof(SetAudioClip));
            var data = entityManager.GetComponentData<SetAudioClip>(_configuration);
            data.ID = ID;
            data.clip = audioClip;
            data.volume = volume;
            entityManager.SetComponentData(_configuration, data);
        }
    }
}

