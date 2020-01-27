using System;
using Modules.AudioHandler.Core;
using Unity.Entities;

namespace Modules.AudioHandler.AudioSorting
{
    public class AudioSortingSystem: ComponentSystem
    {
        private static bool _isSet = false;
        private static AudioSetup _typesList;
        
        /// <summary>
        /// Checks for the AudioSetup component
        /// Checks for StartAudioType and StopAudioType components
        /// </summary>
        protected override void OnUpdate()
        {
            Entities.ForEach((ref AudioSetup setup) =>
            {
                if (_isSet) return;
                _typesList = setup;
                _isSet = true;
            });
            
            Entities.ForEach((Entity e, ref StartAudioType audioType) =>
            {
                StartAudioType(audioType.type, EntityManager);
            });
            
            Entities.ForEach((Entity e, ref StopAudioType audioType) =>
            {
                StopAudioType(audioType.type, EntityManager);
            });
        }

        
        /// <summary>
        /// Starts a specific audio clip
        /// </summary>
        /// <param name="audioType">The type of audio you want to start (e.g. jump)</param>
        /// <param name="entityManager">The EntityManager instance</param>
        public static void StartAudioType(AudioTypes audioType, EntityManager entityManager)
        {
            if (!_isSet) return;
            AudioHanlderSystem.StartAudio(GetAudioID(audioType), entityManager);
        }
        
        
        /// <summary>
        /// Stops a specific audio clip
        /// </summary>
        /// <param name="audioType">The type of audio you want to stop (e.g. jump)</param>
        /// <param name="entityManager">The EntityManager instance</param>
        public static void StopAudioType(AudioTypes audioType, EntityManager entityManager)
        {
            if (!_isSet) return;
            AudioHanlderSystem.StopAudio(GetAudioID(audioType), entityManager);
        }

        
        /// <summary>
        /// Get a specific audio ID
        /// </summary>
        /// <param name="audioType">The type of audio you want the ID of (e.g. jump)</param>
        /// <returns>The audio ID based on the type given</returns>
        private static uint GetAudioID(AudioTypes audioType)
        {
            switch (audioType)
            {
                case AudioTypes.backgroundMusic:
                    return _typesList.backgroundMusic;
                case AudioTypes.jump:
                    return _typesList.jump;
                case AudioTypes.hurt:
                    return _typesList.hurt;
                case AudioTypes.heal:
                    return _typesList.heal;
                case AudioTypes.click:
                    return _typesList.click;
                case AudioTypes.walk:
                    return _typesList.walk;
                case AudioTypes.explosion:
                    return _typesList.explosion;
                case AudioTypes.pickup:
                    return _typesList.pickup;
                case AudioTypes.ability1:
                    return _typesList.ability1;
                case AudioTypes.ability2:
                    return _typesList.ability2;
                case AudioTypes.ability3:
                    return _typesList.ability3;
                case AudioTypes.gameover:
                    return _typesList.gameover;
                case AudioTypes.countdown:
                    return _typesList.countdown;
                case AudioTypes.gamestart:
                    return _typesList.gamestart;
                case AudioTypes.enemy:
                    return _typesList.enemy;
                case AudioTypes.enemyDeath:
                    return _typesList.enemyDeath;
                case AudioTypes.extra1:
                    return _typesList.extra1;
                case AudioTypes.extra2:
                    return _typesList.extra2;
                default:
                    return 0;
            }
        }
    }
}