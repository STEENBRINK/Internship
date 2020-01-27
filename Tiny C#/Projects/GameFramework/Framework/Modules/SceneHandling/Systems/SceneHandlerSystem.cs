using System;
using Modules.EntityHandling;
using Modules.SceneHandling.FlowHandling;
using Modules.Spawner;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Tiny.Scenes;
using UnityEngine;

namespace Modules.SceneHandling
{
    /*
     *
     * SCENEHANDLER
     * Load Scenes
     * Unload Scenes by int, Entity, SceneReference
     * Get the hidden scenemanager
     * 
     */
    public class SceneHandlerSystem: ComponentSystem
    {
        private static NativeArray<Entity> _allEntities;
        private static NativeArray<Entity> _indestructables;
        private static Entity _sceneHandler;
        
        /// <summary>
        /// Checks for the scenemanager, if not found makes it
        /// If the scenemanager is found, checks for scenes to spawn
        /// Checks for GoToScene Components and loads the scene according to the component
        /// </summary>
        protected override void OnUpdate()
        {
            NativeArray<Entity> sceneHanlderArray = GetEntityQuery(typeof(SceneStatistics)).ToEntityArray(Allocator.Temp);
            if (sceneHanlderArray.Length == 0)
            {
                Entity sceneHanlderEntity = EntityManager.CreateEntity();
                EntityManager.AddBuffer<ScenesToLoad>(sceneHanlderEntity);
                EntityManager.AddBuffer<ScenesToUnload>(sceneHanlderEntity);
                EntityManager.AddBuffer<ScenesLoaded>(sceneHanlderEntity);
                EntityManager.AddComponent(sceneHanlderEntity, typeof(Indestructable));
                EntityManager.AddComponent(sceneHanlderEntity, typeof(SceneStatistics));
                var componentData = EntityManager.GetComponentData<SceneStatistics>(sceneHanlderEntity);
                componentData.currentID = 0;
                EntityManager.SetComponentData(sceneHanlderEntity, componentData);
                Debug.Log("SceneManager Loaded");
                _sceneHandler = sceneHanlderEntity;
            }
            else
            {
                Entity sceneHanlder = sceneHanlderArray[0];
                var currentScene = EntityManager.GetComponentData<SceneStatistics>(sceneHanlder);
                NativeArray<ScenesToLoad> scenesToLoad = EntityManager.GetBuffer<ScenesToLoad>(sceneHanlder).ToNativeArray(Allocator.Temp);

                foreach (var sceneToLoad in scenesToLoad)
                {
                    Debug.Log("Loading a scene");
                    //load the scene itself and attach the components to it
                    var sceneLoaded = SceneService.LoadSceneAsync(sceneToLoad.sceneReference);
                    EntityManager.AddComponent(sceneLoaded, typeof(IsCustomScene));
                    EntityManager.AddComponent(sceneLoaded, typeof(IsNewScene));
                    
                    //get the components
                    var newSceneComponent = EntityManager.GetComponentData<IsNewScene>(sceneLoaded);
                    
                    //set the scene ID
                    currentScene.currentID++;
                    
                    //if we want to set the position and/or offset add it to the component
                    if(sceneToLoad.setPos)
                    {
                        newSceneComponent.position = sceneToLoad.pos;
                    }
                    if(sceneToLoad.setOffset)
                    {
                        newSceneComponent.offset = sceneToLoad.offset;
                    }

                    if (sceneToLoad.setPos && sceneToLoad.setOffset)
                        newSceneComponent.translationType = TranslationType.PositionAndOffset;
                    else if(sceneToLoad.setPos)
                        newSceneComponent.translationType = TranslationType.Position;
                    else if(sceneToLoad.setOffset)
                        newSceneComponent.translationType = TranslationType.Offset;
                    else
                        newSceneComponent.translationType = TranslationType.None;
                    
                    //if it should make the scene indestructable
                    if (sceneToLoad.makeIndestrucktable)
                        EntityManager.AddComponent(sceneLoaded, typeof(Indestructable));
                    
                    //move the scene from the ToLoad array to the Loaded array
                    EntityManager.GetBuffer<ScenesLoaded>(sceneHanlder).Add(new ScenesLoaded{ referenceEntity = sceneLoaded});
                    EntityManager.GetBuffer<ScenesToLoad>(sceneHanlder).RemoveAt(0);
                    
                    //set the amount of scenes laoded
                    currentScene.currentScenesLoaded = EntityManager.GetBuffer<ScenesLoaded>(sceneHanlder).Length;
                    
                    //save the components
                    EntityManager.SetComponentData(sceneHanlder, currentScene);
                    EntityManager.SetComponentData(sceneLoaded, newSceneComponent);
                }
                
                scenesToLoad.Dispose();
                
                NativeArray<ScenesToUnload> scenesToUnload = EntityManager.GetBuffer<ScenesToUnload>(sceneHanlder).ToNativeArray(Allocator.Temp);

                foreach (var sceneToUnload in scenesToUnload)
                {
                    if (sceneToUnload.doByNumber)
                        UnloadScene(EntityManager, sceneToUnload.sceneNumber);
                    else
                        UnloadScene(EntityManager, sceneToUnload.scene);
                    
                    EntityManager.GetBuffer<ScenesToUnload>(sceneHanlder).RemoveAt(0);
                }
                
                scenesToUnload.Dispose();
            }
            
            //checks for gotoscene components and loads the referenced scene
            NativeArray<Entity> goToSceneArray = GetEntityQuery(typeof(GoToScene)).ToEntityArray(Allocator.Temp);
            if (goToSceneArray.Length > 0)
            {
                GoToScene component = EntityManager.GetComponentData<GoToScene>(goToSceneArray[0]);
                NextScene(component.sceneToGoTo, EntityManager, Entities, true);

                foreach (var entity in goToSceneArray)
                {
                    PostUpdateCommands.RemoveComponent<GoToScene>(entity);
                }
            }
            goToSceneArray.Dispose();
            
            //checks for removescene components and unloads the referenced scene
            NativeArray<Entity> removeSceneArray = GetEntityQuery(typeof(RemoveScene)).ToEntityArray(Allocator.Temp);
            if (removeSceneArray.Length > 0)
            {
                foreach (var entity in removeSceneArray)
                {
                    RemoveScene sceneToUnload = EntityManager.GetComponentData<RemoveScene>(entity);
                    if (sceneToUnload.isInt)
                        UnloadScene(EntityManager, sceneToUnload.sceneNumberToUnload);
                    else
                        UnloadScene(EntityManager, sceneToUnload.sceneEntityToUnload);
                    
                    PostUpdateCommands.RemoveComponent<RemoveScene>(entity);
                }
            }
            removeSceneArray.Dispose();
            
            
            //checks for gotopreviousscene components and goes to previous scene if found
            NativeArray<Entity> goToPreviousSceneArray = GetEntityQuery(typeof(GoToPreviousScene)).ToEntityArray(Allocator.Temp);
            if (goToPreviousSceneArray.Length > 0)
            {
                PreviousScene(EntityManager, Entities);
                foreach (var entity in goToPreviousSceneArray)
                {
                    PostUpdateCommands.RemoveComponent<GoToPreviousScene>(entity);
                }
            }
            goToPreviousSceneArray.Dispose();
            
            //checks for addscene components and loads the scene
            Entities.ForEach((Entity e, ref AddScene sceneToGoTo) =>
            {
                LoadSceneAsync(sceneToGoTo.sceneToLoad, sceneToGoTo.makeIndestructable, Entities);
                PostUpdateCommands.RemoveComponent<AddScene>(e);
            });
            
            //checks for addscenewithpos components and loads the scene
            Entities.ForEach((Entity e, ref AddSceneWithTranslation sceneToGoTo) =>
            {
                switch (sceneToGoTo.translationType)
                {
                    case (TranslationType.Position):
                        LoadSceneAsyncWithPosition(sceneToGoTo.sceneToLoad, sceneToGoTo.makeIndestructable, Entities,  sceneToGoTo.pos);
                        break;
                    case (TranslationType.Offset):
                        LoadSceneAsyncWithOffset(sceneToGoTo.sceneToLoad, sceneToGoTo.makeIndestructable, Entities,  sceneToGoTo.offset);
                        break;
                    case (TranslationType.PositionAndOffset):
                        LoadSceneAsyncWithPositionAndOffset(sceneToGoTo.sceneToLoad, sceneToGoTo.makeIndestructable, Entities,  sceneToGoTo.pos, sceneToGoTo.offset);
                        break;
                    case TranslationType.None:
                        LoadSceneAsync(sceneToGoTo.sceneToLoad, sceneToGoTo.makeIndestructable, Entities);
                        break;
                    default:
                        LoadSceneAsync(sceneToGoTo.sceneToLoad, sceneToGoTo.makeIndestructable, Entities);
                        break;
                }
                PostUpdateCommands.RemoveComponent<AddSceneWithTranslation>(e);
            });

            sceneHanlderArray.Dispose();
            GetEntitiesFromSceneGuid();
            GetIndestructables();
        }
        
        /*
         * STATIC METHODS
         */

        
        /// <summary>
        /// Adds a scenereference to lists of scenes to spawn a copy of it during the next scene in the OnUpdate()
        /// The position is added to all entities in the scene
        /// </summary>
        /// <param name="sceneReference">A reference to the scene to spawn</param>
        /// <param name="isIndestructable">If true, there will be NO way to unload the scene</param>
        /// <param name="entities">The EntitiesQueryBuilder Entities</param>
        /// <param name="posGiven">The absolute new position of the sceneEntities</param>
        /// <returns>A bool to mark the correct loading of the scene</returns>
        public static bool LoadSceneAsyncWithPosition(SceneReference sceneReference, bool isIndestructable, EntityQueryBuilder entities, float2 posGiven)
        {
            try
            {
                entities.ForEach((DynamicBuffer<ScenesToLoad> scenesToLoad) =>
                {
                    scenesToLoad.Add(new ScenesToLoad
                    {
                        sceneReference = sceneReference,
                        makeIndestrucktable = isIndestructable,
                        setPos = true,
                        pos = posGiven
                    });
                });
                
                return true;
            }
            catch (Exception e)
            {
                Debug.Log(e.ToString());
                return false;
            }
        }
        
        
        /// <summary>
        /// Adds a scenereference to lists of scenes to spawn a copy of it during the next scene in the OnUpdate()
        /// The offset is added to all entities in the scene
        /// </summary>
        /// <param name="sceneReference">A reference to the scene to spawn</param>
        /// <param name="isIndestructable">If true, there will be NO way to unload the scene</param>
        /// <param name="entities">The EntitiesQueryBuilder Entities</param>
        /// <param name="offsetGiven">The relative new position of the sceneEntities</param>
        /// <returns>A bool to mark the correct loading of the scene</returns>
        public static bool LoadSceneAsyncWithOffset(SceneReference sceneReference, bool isIndestructable, EntityQueryBuilder entities, float2 offsetGiven)
        {
            try
            {
                entities.ForEach((DynamicBuffer<ScenesToLoad> scenesToLoad) =>
                {
                    scenesToLoad.Add(new ScenesToLoad
                    {
                        sceneReference = sceneReference,
                        makeIndestrucktable = isIndestructable,
                        setOffset = true,
                        offset = offsetGiven
                    });
                });
                
                return true;
            }
            catch (Exception e)
            {
                Debug.Log(e.ToString());
                return false;
            }
        }
        
        
        /// <summary>
        /// Adds a scenereference to lists of scenes to spawn a copy of it during the next scene in the OnUpdate()
        /// The position and offset is added to all entities in the scene
        /// </summary>
        /// <param name="sceneReference">A reference to the scene to spawn</param>
        /// <param name="isIndestructable">If true, there will be NO way to unload the scene</param>
        /// <param name="entities">The EntitiesQueryBuilder Entities</param>
        /// <param name="posGiven">The absolute new position of the sceneEntities</param>
        /// <param name="offsetGiven">The relative new position of the sceneEntities</param>
        /// <returns>A bool to mark the correct loading of the scene</returns>
        public static bool LoadSceneAsyncWithPositionAndOffset(SceneReference sceneReference, bool isIndestructable, EntityQueryBuilder entities, float2 posGiven, float2 offsetGiven)
        {
            try
            {
                entities.ForEach((DynamicBuffer<ScenesToLoad> scenesToLoad) =>
                {
                    scenesToLoad.Add(new ScenesToLoad
                    {
                        sceneReference = sceneReference,
                        makeIndestrucktable = isIndestructable,
                        setPos = true,
                        setOffset = true,
                        pos = posGiven,
                        offset = offsetGiven
                    });
                });
                
                return true;
            }
            catch (Exception e)
            {
                Debug.Log(e.ToString());
                return false;
            }
        }


        /// <summary>
        /// Adds a scenereference to lists of scenes to spawn a copy of it during the next scene in the OnUpdate()
        /// </summary>
        /// <param name="sceneReference">A reference to the scene to spawn</param>
        /// <param name="isIndestructable">If true, there will be NO way to unload the scene</param>
        /// <param name="entities">The EntitiesQueryBuilder Entities</param>
        /// <returns>A bool to mark the correct loading of the scene</returns>
        public static bool LoadSceneAsync(SceneReference sceneReference, bool isIndestructable, EntityQueryBuilder entities)
        {
            try
            {
                entities.ForEach((DynamicBuffer<ScenesToLoad> scenesToLoad) =>
                {
                    scenesToLoad.Add(new ScenesToLoad
                    {
                        sceneReference = sceneReference,
                        makeIndestrucktable = isIndestructable,
                        setPos = false,
                        setOffset = false
                    });
                });
                
                return true;
            }
            catch (Exception e)
            {
                Debug.Log(e.ToString());
                return false;
            }
        }

        /// <summary>
        /// Marks a scene for unloading
        /// </summary>
        /// <param name="entityManager">Reference to the entitymanager instance</param>
        /// <param name="entities">A reference tot the entityquerybuilder instance named entities</param>
        /// <param name="sceneToUnload">The Entity with the SceneData component</param>
        /// <returns>Weather or not the scene is succesfully marked for unloading</returns>
        public static bool MarkSceneForUnload(EntityManager entityManager, EntityQueryBuilder entities, Entity sceneToUnload)
        {
            if (!entityManager.HasComponent<Indestructable>(sceneToUnload))
            {
                try
                {
                    entities.ForEach((DynamicBuffer<ScenesToUnload> scenesToLoad) =>
                    {
                        scenesToLoad.Add(new ScenesToUnload
                        {
                            scene = sceneToUnload,
                            doByNumber = false
                        });
                    });

                    return true;
                }
                catch (Exception e)
                {
                    Debug.Log(e.ToString());
                }
            }

            return false;
        }
        
        /// <summary>
        /// Marks a scene for unloading
        /// </summary>
        /// <param name="entityManager">Reference to the entitymanager instance</param>
        /// <param name="entities">A reference tot the entityquerybuilder instance named entities</param>
        /// <param name="sceneNumberToUnload">The index fo the scene to unload</param>
        /// <returns>Weather or not the scene is succesfully marked for unloading</returns>
        public static bool MarkSceneForUnload(EntityManager entityManager, EntityQueryBuilder entities, int sceneNumberToUnload)
        {
            NativeArray<ScenesLoaded> scenesLoaded = entityManager.GetBuffer<ScenesLoaded>(_sceneHandler).ToNativeArray(Allocator.Temp);

            if (!entityManager.HasComponent<Indestructable>(scenesLoaded[sceneNumberToUnload].referenceEntity))
            {
                try
                {
                    entities.ForEach((DynamicBuffer<ScenesToUnload> scenesToLoad) =>
                    {
                        scenesToLoad.Add(new ScenesToUnload
                        {
                            sceneNumber = sceneNumberToUnload,
                            doByNumber = true
                        });
                    });

                    return true;
                }
                catch (Exception e)
                {
                    Debug.Log(e.ToString());
                }
            }
            scenesLoaded.Dispose();
            return false;
        }
        
        /// <summary>
        /// Unloads a (non indestructable) scene at a certain index
        /// </summary>
        /// <param name="entityManager">Reference to the entitymanager instance</param>
        /// <param name="sceneNumber">The index of the LoadedScenesArray (only accessible if kept manualy)</param>
        /// <returns>A bool to mark the correct unloading of the scene</returns>
        private static bool UnloadScene(EntityManager entityManager, int sceneNumber)
        {
            Debug.Log("Unloading a scene");
            try
            {
                NativeArray<ScenesLoaded> scenesLoaded = entityManager.GetBuffer<ScenesLoaded>(_sceneHandler).ToNativeArray(Allocator.Temp);

                if (!entityManager.HasComponent<Indestructable>(scenesLoaded[sceneNumber].referenceEntity))
                {
                    SceneService.UnloadSceneInstance(scenesLoaded[sceneNumber].referenceEntity);
                    GetScenesLoadedBuffer(entityManager).RemoveAt(sceneNumber);
                    var currentScene = entityManager.GetComponentData<SceneStatistics>(_sceneHandler);
                    currentScene.currentScenesLoaded = entityManager.GetBuffer<ScenesLoaded>(_sceneHandler).Length;
                    entityManager.SetComponentData(_sceneHandler, currentScene);
                
                    scenesLoaded.Dispose();

                    return true;
                }
            }
            catch (Exception e)
            {
                Debug.Log(e.ToString());
            }

            return false;
        }
        

        /// <summary>
        /// Unloads a (non indestructable) scene based on it's Entity
        /// </summary>
        /// <param name="entityManager">A reference to the entitymanager</param>
        /// <param name="sceneEntity">The Entity with the SceneData component</param>
        /// <returns>A bool to mark the correct scene unloading</returns>
        private static bool UnloadScene(EntityManager entityManager, Entity sceneEntity)
        {
            Debug.Log("Unloading a scene");
            try
            {
                if (!entityManager.HasComponent<Indestructable>(sceneEntity))
                {
                    SceneService.UnloadSceneInstance(sceneEntity);
                    GetScenesLoadedBuffer(entityManager).RemoveAt(GetSceneEntities(entityManager).IndexOf(sceneEntity));
                    var currentScene = entityManager.GetComponentData<SceneStatistics>(_sceneHandler);
                    currentScene.currentScenesLoaded = entityManager.GetBuffer<ScenesLoaded>(_sceneHandler).Length;
                    entityManager.SetComponentData(_sceneHandler, currentScene);
                    return true;
                }
            }
            catch (Exception e)
            {
                Debug.Log(e.ToString());
            }
            return false;
        }
        
        /// <summary>
        /// Unloads all scenes and loads a next scene, stores the previous scene in the previousscene component
        /// </summary>
        /// <remarks>Make sure this fuction is only called once, don't spam it</remarks>
        /// <param name="sceneReference">A reference to the scene to load</param>
        /// <param name="entityManager">A reference to the entitymanager instance</param>
        /// <param name="entities">A reference tot the entityquerybuilder instance named entities</param>
        /// <param name="keepPrevious">A reference to the scenehandler entity</param>
        /// <returns>A bool to mark the correct loading and unloading of the scenes</returns>
        public static bool NextScene(SceneReference sceneReference, EntityManager entityManager, EntityQueryBuilder entities, bool keepPrevious)
        {
            try
            {
                if (!UnloadAllScenes(keepPrevious, entityManager))
                {
                    return false;
                }
                return LoadSceneAsync(sceneReference, false, entities);
            }
            catch (Exception e)
            {
                Debug.Log(e.ToString());
                return false;
            }
        }
        
        
        /// <summary>
        /// Unloads all scenes and load in a copy of the previous scene
        /// </summary>
        /// <param name="entityManager">A reference to the entitymanager instance</param>
        /// <param name="entities">A reference tot the entityquerybuilder instance named entities</param>
        /// <returns>A bool to mark the correct unloading of the scenes and loading of the scene</returns>
        public static bool PreviousScene(EntityManager entityManager, EntityQueryBuilder entities)
        {
            try
            {
                if (!UnloadAllScenes(false, entityManager))
                    return false;

                var guid = entityManager.GetComponentData<SceneStatistics>(_sceneHandler).previousSceneGuid.Guid;
                var newReference = new SceneReference();
                newReference.SceneGuid = guid;
                
                return LoadSceneAsync(newReference, false, entities);
            }
            catch (Exception e)
            {
                Debug.Log(e.ToString());
                return false;
            }
        }
        
        
        /// <summary>
        /// Unloads all instances of a certain scenereference INCLUDING INDESTUCTIBLE ONES
        /// </summary>
        /// <warning>This will unload indestructable scenes! Use with care</warning>
        /// <param name="sceneReference">A reference to the scenes to unload</param>
        /// <param name="entityManager">A reference to the entitymanager instance</param>
        /// <returns>A bool to mark the correct unloading of the scenes</returns>
        public static bool UnloadAllScenesOfType(SceneReference sceneReference, EntityManager entityManager)
        {
            try
            {
                var sceneEntities = GetSceneEntities(entityManager);
                for (int i = 0; i < sceneEntities.Length; i++)
                {
                    if (entityManager.GetSharedComponentData<SceneGuid>(sceneEntities[i]).Guid.GetHashCode().Equals(sceneReference.SceneGuid.GetHashCode()))
                    {
                        GetScenesLoadedBuffer(entityManager).RemoveAt(i);
                    }
                }
                
                SceneService.UnloadAllSceneInstances(sceneReference);
                return true;
            }
            catch (Exception e)
            {
                Debug.Log(e.ToString());
                return false;
            }
        }

        /// <summary>
        /// Unloads all the loaded (not indestructable) scenes
        /// </summary>
        /// <param name="keepPrevious">Should we keep the last scene we unload stored</param>
        /// <param name="entityManager">The EntityManger instance</param>
        /// <returns>A bool to indicate the correct unloading and loading of the scenes</returns>
        public static bool UnloadAllScenes(bool keepPrevious, EntityManager entityManager)
        {
            try
            {
                foreach (var scene in GetScenesLoadedArray(entityManager))
                {
                    if (!IsSceneLoaded(scene.referenceEntity)) continue;
                    if (entityManager.HasComponent<Indestructable>(scene.referenceEntity)) continue;
                    if (keepPrevious)
                    {
                        KeepPrevious(entityManager, scene.referenceEntity);
                    }

                    if (!UnloadScene(entityManager, scene.referenceEntity))
                    {
                        return false;
                    }
                }

                return true;
            }
            catch (Exception e)
            {
                Debug.Log(e.ToString());
                return false;
            }
        }

        /// <summary>
        /// Gets the current amount of loaded scenes
        /// </summary>
        /// <param name="entityManager">The EntityManger instance</param>
        /// <returns>the current amount of loaded scenes as int</returns>
        public static int GetCurrentSceneNumber(EntityManager entityManager)
        {
            return entityManager.GetComponentData<SceneStatistics>(_sceneHandler).currentScenesLoaded;
        }
        
        /// <summary>
        /// Gets all the entities from a certain guid
        /// </summary>
        /// <param name="scene">The scene entity</param>
        /// <param name="entityManager">The EntityManger instance</param>
        /// <warning>Make sure the scene is loaded when called!</warning>
        /// <returns>All the entities in a scene as native array</returns>
        public static NativeArray<Entity> GetAllEntitiesFromGuid(Entity scene, EntityManager entityManager)
        {
            var counter = 0;
            try
            {
                NativeArray<Entity> entities = _allEntities;
                NativeArray<Entity> tempArray = new NativeArray<Entity>(entities.Length, Allocator.Temp);
                
                SceneGuid guid = new SceneGuid();
                for(var i = 0; i < entities.Length;i++)
                {
                    guid = entityManager.GetSharedComponentData<SceneGuid>(entities[i]);
                    var loadedGuid = entityManager.GetSharedComponentData<SceneGuid>(scene);
                    
                    if (guid.Equals(loadedGuid) && !entityManager.HasComponent<IsNewScene>(entities[i]))
                    {
                        tempArray[counter] = entities[i];
                        counter++;
                    }
                }
                
                if (counter != 0)
                {
                    NativeArray<Entity> returnArray = new NativeArray<Entity>((counter), Allocator.Temp);
                    for (int i = 0; i < counter; i++)
                    {
                        returnArray[i] = tempArray[i];
                    }
                    return returnArray;
                }
                else
                {
                    throw new NoEntitiesFoundException();
                }

            }
            catch (Exception exception)
            {
                Debug.Log(exception.ToString());
                throw exception;
            }
        }
        
        /// <summary>
        /// Gets all the entities from a certain guid that have not been handled yet
        /// </summary>
        /// <param name="scene">The scene entity</param>
        /// <param name="entityManager">The EntityManger instance</param>
        /// <warning>Make sure the scene is loaded when called!</warning>
        /// <warning>When multiples scenes are loaded from the same scenereference in the same frame, handles the entities as entities from one scene</warning>
        /// <returns>All the entities in a scene as native array</returns>
        public static NativeArray<Entity> GetNewEntitiesFromGuid(Entity scene, EntityManager entityManager)
        {
            var counter = 0;
            try
            {
                NativeArray<Entity> entities = _allEntities;
                NativeArray<Entity> tempArray = new NativeArray<Entity>(entities.Length, Allocator.Temp);

                SceneGuid guid;
                for (var i = 0; i < entities.Length; i++)
                {
                    guid = entityManager.GetSharedComponentData<SceneGuid>(entities[i]);
                    var loadedGuid = entityManager.GetSharedComponentData<SceneGuid>(scene);
                    
                    if ((guid.Equals(loadedGuid) && 
                        !entityManager.HasComponent<EntityHandled>(entities[i])) &&
                        !entityManager.HasComponent<IsNewScene>(entities[i]))
                    {
                        tempArray[counter] = entities[i];
                        counter++;
                    }
                }

                if (counter != 0)
                {
                    NativeArray<Entity> returnArray = new NativeArray<Entity>((counter), Allocator.Temp);
                    for (int i = 0; i < counter; i++)
                    {
                        returnArray[i] = tempArray[i];
                    }
                    return returnArray;
                }
                else
                {
                    Debug.Log("No Entities Found");
                    return new NativeArray<Entity>(0, Allocator.Temp);
                }

            }
            catch (Exception exception)
            {
                Debug.Log(exception.ToString());
                throw exception;
            }
        }

        /// <summary>
        /// Returns the scene entity of an entity if custom loaded 
        /// </summary>
        /// <param name="entityManager">The EntityManger instance</param>
        /// <param name="entityInScene">The entity from which you want to get the scene</param>
        /// <returns></returns>
        public static Entity GetSceneFromEntityHandled(EntityManager entityManager, Entity entityInScene)
        {
            try
            {
                return entityManager.GetComponentData<EntityHandled>(entityInScene).scene;
            }
            catch (Exception e)
            {
                Debug.Log(e.ToString());
                throw;
            }
        }

        /// <summary>
        /// Gets all the loaded scenes as an array
        /// </summary>
        /// <param name="entityManager">The EntityManger instance</param>
        /// <returns>The loaded scenes as nativeArray</returns>
        public static NativeArray<ScenesLoaded> GetScenesLoadedArray(EntityManager entityManager)
        {
            return entityManager.GetBuffer<ScenesLoaded>(_sceneHandler).ToNativeArray(Allocator.Temp);
        }
        
        /// <summary>
        /// Gets all the loaded scenes as buffer
        /// </summary>
        /// <param name="entityManager">The EntityManger instance</param>
        /// <returns>all the loaded scenes in a DynamicBuffer</returns>
        public static DynamicBuffer<ScenesLoaded> GetScenesLoadedBuffer(EntityManager entityManager)
        {
            
            return entityManager.GetBuffer<ScenesLoaded>(_sceneHandler);
        }

        /// <summary>
        /// Checks if a certain scene is loaded
        /// </summary>
        /// <param name="scene">A reference to the scene to check</param>
        /// <returns>A bool equal to if the scene is loaded or not</returns>
        public static bool IsSceneLoaded(Entity scene)
        {
            return (SceneService.GetSceneStatus(scene) == SceneStatus.Loaded);
        }
        
        /// <summary>
        /// Returns all indestructable entities
        /// </summary>
        /// <returns>A Entity Array with all the scene entities with the indestructable tag</returns>
        public static NativeArray<Entity> GetIndestructableEntities()
        {
            return _indestructables;
        }
        
        /// <summary>
        /// Gets the scenemanager entity
        /// </summary>
        /// <returns>The SceneManager Entity</returns>
        public static Entity GetSceneHandler()
        {
            return _sceneHandler;
        }


        /*
         * NON STATIC METHODS
         */
        
        /*
         * Private util
         */
        
        /// <summary>
        /// Saves the previous scene
        /// </summary>
        /// <param name="entityManager">The EntityManger instance</param>
        /// <param name="scene">The scene entity</param>
        private static void KeepPrevious(EntityManager entityManager, Entity scene)
        {
            var sceneData = entityManager.GetComponentData<Unity.Tiny.Scenes.SceneData>(scene);
            var guid = sceneData.Scene.SceneGuid;
            var component = entityManager.GetComponentData<SceneStatistics>(_sceneHandler);
            component.previousSceneGuid = guid;
            entityManager.SetComponentData(_sceneHandler, component);
        }
        
        

        /// <summary>
        /// Gets all the scene entities
        /// </summary>
        /// <param name="entityManager">The EntityManger instance</param>
        /// <returns>A nativeArray with all the scene entities</returns>
        private static NativeArray<Entity> GetSceneEntities(EntityManager entityManager)
        {
            NativeArray<ScenesLoaded> loaded = GetScenesLoadedArray(entityManager);
            NativeArray<Entity> newArray = new NativeArray<Entity>(loaded.Length, Allocator.Temp);
            for (var i = 0; i < loaded.Length; i++)
            {
                newArray[i] = loaded[i].referenceEntity;
            }

            return newArray;
        }

        /// <summary>
        /// Get all entities by sceneguid element
        /// </summary>
        /// <remarks>Called every update</remarks>
        private void GetEntitiesFromSceneGuid()
        {
            _allEntities =  GetEntityQuery(typeof(SceneGuid)).ToEntityArray(Allocator.Temp);
        }

        /// <summary>
        /// Get all entities by indestructable element
        /// </summary>
        /// <remarks>Called every update</remarks>
        private void GetIndestructables()
        {
            _indestructables = GetEntityQuery(typeof(Indestructable)).ToEntityArray(Allocator.Temp);
        }
    }
}