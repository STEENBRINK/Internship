using System;
using Modules.SceneHandling;
using Modules.SceneHandling.FlowHandling;
using Modules.Spawner;
using Modules.Timer;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Tiny.Scenes;
using UnityEngine;

namespace Modules.Spawner
{
    public class SpawnerSystem : ComponentSystem
    {
        /// <summary>
        /// Checks every spawner
        /// if on a timer, checks for the timers
        /// loads scenes if spawner is triggered
        /// </summary>
        /// <exception cref="NoTimerFoundException">If no timers are found while spawntype is timed</exception>
        protected override void OnUpdate()
        {
            Entities.ForEach((ref Spawner spawner) =>
            {
                var currentSpawner = spawner;
                
                if (spawner.spawnType == SpawnType.Timed)
                {
                    var timerArray = GetEntityQuery(typeof(Timer.Timer)).ToEntityArray(Allocator.Temp);
                    if (timerArray.Length == 0)
                        throw new NoTimerFoundException(currentSpawner.ID);
                    timerArray.Dispose();
                    
                    Entities.ForEach((ref Timer.Timer timer) =>
                    {
                        if (timer.isMarkedDone && (timer.ID == currentSpawner.timerID))
                        {
                            currentSpawner.isTriggered = true;
                            TimerSystem.ResetTimer(timer.ID, Entities);
                        }
                    });
                }

                if ((!spawner.isTriggered && !currentSpawner.isTriggered) || spawner.isSpawningPaused) return;
                switch (spawner.translationType)
                {
                    case (TranslationType.Position):
                        SceneHandlerSystem.LoadSceneAsyncWithPosition(spawner.sceneReferenceToSpawn, false, Entities,  spawner.spawnPos);
                        break;
                    case (TranslationType.Offset):
                        SceneHandlerSystem.LoadSceneAsyncWithOffset(spawner.sceneReferenceToSpawn, false, Entities,  spawner.spawnOffset);
                        break;
                    case (TranslationType.PositionAndOffset):
                        SceneHandlerSystem.LoadSceneAsyncWithPositionAndOffset(spawner.sceneReferenceToSpawn, false, Entities,  spawner.spawnPos, spawner.spawnOffset);
                        break;
                    case TranslationType.None:
                        SceneHandlerSystem.LoadSceneAsync(spawner.sceneReferenceToSpawn, false, Entities);
                        break;
                    default:
                        SceneHandlerSystem.LoadSceneAsync(spawner.sceneReferenceToSpawn, false, Entities);
                        break;
                }
                spawner.isTriggered = false;

            });
        }

        /// <summary>
        /// Triggers both timed and manual spawners to spawn
        /// </summary>
        /// <param name="entities">A reference to the entityquerybuilder instance</param>
        /// <param name="ID">The ID of the spawner to trigger</param>
        public static void Trigger(EntityQueryBuilder entities, uint ID)
        {
            entities.ForEach((ref Spawner spawner) =>
            {
                if (spawner.ID == ID)
                {
                    spawner.isTriggered = true;
                }
            });
        }
        
        /// <summary>
        /// Triggers both timed and manual spawners to spawn and set a new scenerefernce to spawn
        /// </summary>
        /// <param name="entities">A reference to the entityquerybuilder instance</param>
        /// <param name="ID">The ID of the spawner to trigger</param>
        /// <param name="sceneReference">The new scenereference to spawn</param>
        public static void Trigger(EntityQueryBuilder entities, uint ID, SceneReference sceneReference)
        {
            entities.ForEach((ref Spawner spawner) =>
            {
                if (spawner.ID == ID)
                {
                    spawner.isTriggered = true;
                    spawner.sceneReferenceToSpawn = sceneReference;
                }
            });
        }
        
        /// <summary>
        /// Set a new scenerefernce to spawn
        /// </summary>
        /// <param name="entities">A reference to the entityquerybuilder instance</param>
        /// <param name="ID">The ID of the spawner to trigger</param>
        /// <param name="sceneReference">The new scenereference to spawn</param>
        public static void SetSceneReference(EntityQueryBuilder entities, uint ID, SceneReference sceneReference)
        {
            entities.ForEach((ref Spawner spawner) =>
            {
                if (spawner.ID == ID)
                {
                    spawner.sceneReferenceToSpawn = sceneReference;
                }
            });
        }

        /// <summary>
        /// Pause a spawner from spawning scenes
        /// </summary>
        /// <param name="entities">A reference to the entityquerybuilder instance</param>
        /// <param name="ID">The ID of the spawner to trigger</param>
        public static void PauseSpawning(EntityQueryBuilder entities, uint ID)
        {
            entities.ForEach((ref Spawner spawner) =>
            {
                if (spawner.ID == ID)
                {
                    spawner.isSpawningPaused = true;
                }
            });
        }

        /// <summary>
        /// Resume a spawner to spawning scenes
        /// </summary>
        /// <param name="entities">A reference to the entityquerybuilder instance</param>
        /// <param name="ID">The ID of the spawner to trigger</param>
        public static void ResumeSpawning(EntityQueryBuilder entities, uint ID)
        {
            entities.ForEach((ref Spawner spawner) =>
            {
                if (spawner.ID == ID)
                {
                    spawner.isSpawningPaused = false;
                }
            });
        }

        /// <summary>
        /// Set a spawner to a new spawntype
        /// </summary>
        /// <param name="entities">A reference to the entityquerybuilder instance</param>
        /// <param name="ID">The ID of the spawner to trigger</param>
        /// <param name="type">The new spawntype</param>
        public static void SetSpawnMode(EntityQueryBuilder entities, uint ID, SpawnType type)
        {
            entities.ForEach((ref Spawner spawner) =>
            {
                if (spawner.ID == ID)
                {
                    spawner.spawnType = type;
                }
            });
        }

        
        /// <summary>
        /// Set a new absolute spawning position
        /// </summary>
        /// <param name="entities">A reference to the entityquerybuilder instance</param>
        /// <param name="ID">The ID of the spawner to trigger</param>
        /// <param name="newPos">The new absolute position</param>
        public static void SetSpawnPos(EntityQueryBuilder entities, uint ID, float2 newPos)
        {
            entities.ForEach((ref Spawner spawner) =>
            {
                if (spawner.ID == ID)
                {
                    spawner.spawnPos = newPos;
                }
            });
        }
        
        
        /// <summary>
        /// Set a new relative spawning position
        /// </summary>
        /// <param name="entities">A reference to the entityquerybuilder instance</param>
        /// <param name="ID">The ID of the spawner to trigger</param>
        /// <param name="newOffset">The new relative position</param>
        public static void SetSpawnOffset(EntityQueryBuilder entities, uint ID, float2 newOffset)
        {
            entities.ForEach((ref Spawner spawner) =>
            {
                if (spawner.ID == ID)
                {
                    spawner.spawnOffset = newOffset;
                }
            });
        }

        /// <summary>
        /// Set the spawner to spawn with or without position and/or offset
        /// </summary>
        /// <param name="entities">A reference to the entityquerybuilder instance</param>
        /// <param name="ID">The ID of the spawner to trigger</param>
        /// <param name="translationType">The type of translation you want to add to all entities in the scene</param>
        public static void SetTranslationType(EntityQueryBuilder entities, uint ID, TranslationType translationType)
        {
            entities.ForEach((ref Spawner spawner) =>
            {
                if (spawner.ID == ID)
                {
                    spawner.translationType = translationType;
                }
            });
        }
    }
}

