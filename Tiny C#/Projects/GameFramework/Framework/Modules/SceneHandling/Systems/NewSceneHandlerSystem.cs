using System;
using Modules.EntityHandling;
using Modules.Spawner;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Tiny.Scenes;
using UnityEngine;

namespace Modules.SceneHandling
{
    public class NewSceneHandlerSystem: ComponentSystem
    {
        /// <summary>
        /// Checks for all new scenes, if they are loaded adds the data to the newEntity components, after destroys tag
        /// </summary>
        /// <warning>When multiples scenes are loaded from the same scenereference in the same frame, handles them as entities from one scene, giving them all the same relative postiotion and ID</warning>
        protected override void OnUpdate()
        {
            NativeArray<Entity> newSceneArray = GetEntityQuery(typeof(IsNewScene)).ToEntityArray(Allocator.Temp);
            foreach (var scene in newSceneArray)
            {
                //if the scene is loaded
                if (!SceneHandlerSystem.IsSceneLoaded(scene)) 
                    continue;
                var newScene = EntityManager.GetComponentData<IsNewScene>(scene);
                var allEntitiesInScene = SceneHandlerSystem.GetNewEntitiesFromGuid(scene, EntityManager);
                    
                foreach (var entity in allEntitiesInScene)
                {
                    EntityManager.AddComponent(entity, typeof(IsNewEntity));
                    EntityManager.AddComponent(entity, typeof(EntityHandled));
                    
                    var handled = EntityManager.GetComponentData<EntityHandled>(entity);
                    
                    handled.scene = scene;
                    
                    EntityManager.SetComponentData(entity, handled);
                    
                    var componentData = EntityManager.GetComponentData<IsNewEntity>(entity);
                    
                    componentData.translationType = newScene.translationType;

                    switch (newScene.translationType)
                    {
                        case TranslationType.Position:
                            componentData.pos = newScene.position;
                            break;
                        case TranslationType.Offset:
                            componentData.offset = newScene.offset;
                            break;
                        case TranslationType.PositionAndOffset:
                            componentData.pos = newScene.position;
                            componentData.offset = newScene.offset;
                            break;
                        case TranslationType.None:
                            break;
                        default:
                            break;
                    }
                    
                    EntityManager.SetComponentData(entity, componentData);
                }
                    
                PostUpdateCommands.RemoveComponent<IsNewScene>(scene);
            }
            newSceneArray.Dispose();
            
            
        }
    }
}