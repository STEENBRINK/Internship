using System;
using Unity.Collections;
using Unity.Entities;
using Unity.Tiny.Scenes;
using UnityEngine;

namespace Modules.SceneHandling.FlowHandling
{
    public class FlowHandlerSystem: ComponentSystem
    {
        private static Entity _flowManagerEntity;
        private static DynamicBuffer<Flow> _flow;
        
        /// <summary>
        /// Checks for the flow component to initialize
        /// Checks for the flowmanager, if not found makes it
        /// If the scenemanager is found, checks for components to load the scenes according to it
        /// </summary>
        protected override void OnUpdate()
        {
            NativeArray<Entity> flowManagerArray = GetEntityQuery(typeof(FlowStatistics)).ToEntityArray(Allocator.Temp);
            NativeArray<Entity> flowArray = GetEntityQuery(typeof(Flow)).ToEntityArray(Allocator.Temp);
            if (flowArray.Length == 1)
            {
                if (flowManagerArray.Length == 0)
                {
                    _flowManagerEntity = EntityManager.CreateEntity();
                    EntityManager.AddComponent(_flowManagerEntity, typeof(FlowStatistics));
                    Debug.Log("FlowManager Loaded");
                    GoToNumberInFlow(EntityManager, 0);
                }
                _flow = EntityManager.GetBuffer<Flow>(flowArray[0]);
            }
            else if(flowArray.Length > 1)
            {
                throw new MultipleFlowsFoundException();
            }
            flowArray.Dispose();
            flowManagerArray.Dispose();
            
            Entities.ForEach((Entity e, DynamicBuffer<Flow> flowBuffer) =>
            {
                var sceneHandler = GetEntityQuery(typeof(SceneStatistics)).GetSingletonEntity();
                for(var i = 0; i < flowBuffer.Length; i++)
                {
                    var flowElement = flowBuffer[i];
                    
                    //enable when enums are working correctly
                    //if (flowElement.sceneType == SceneType.Login)
                    if(flowElement.login)
                    {
                        Entities.WithAll<LoggedIn>().ForEach((e2) =>
                        {
                            Debug.Log("LoggedIn detected at: " + i);
                            flowElement.disabledInFlow = true;
                            flowBuffer.RemoveAt(i);
                            flowBuffer.Insert(i, flowElement);
                            
                            PostUpdateCommands.RemoveComponent<LoggedIn>(e2);
                            Entities.ForEach((ref FlowStatistics flowStatistics) =>
                                {
                                    flowStatistics.isLoggedIn = true;
                                });
                        });
                        
                        Entities.WithAll<LoggedOut>().ForEach((e2) =>
                        {
                            Debug.Log("LoggedOut detected");
                            flowElement.disabledInFlow = false;
                            flowBuffer.RemoveAt(i);
                            flowBuffer.Insert(i, flowElement);
                            PostUpdateCommands.RemoveComponent<LoggedOut>(e2);
                            Entities.ForEach((ref FlowStatistics flowStatistics) =>
                            {
                                flowStatistics.isLoggedIn = false;
                            });
                        });
                        
                        Entities.WithAll<GoToLoginScene>().ForEach((e2) =>
                        {
                            Debug.Log("GoToLoginScene detected");
                            if(LoadFlowScene(i, EntityManager, Entities))
                                PostUpdateCommands.RemoveComponent<GoToLoginScene>(e2);
                        });
                    }
                    //enable when enums are working correctly
                    //if (flowElement.sceneType == SceneType.Game)
                    if(flowElement.game)
                    {
                        Entities.WithAll<GoToGameScene>().ForEach((e2) =>
                        {
                            Debug.Log("GoToGameScene detected");
                            if(LoadFlowScene(i, EntityManager, Entities))
                                PostUpdateCommands.RemoveComponent<GoToGameScene>(e2);
                        });
                    }
                    //enable when enums are working correctly
                    //if (flowElement.sceneType == SceneType.Options)
                    if(flowElement.options)
                    {
                        Entities.WithAll<GoToOptionsScene>().ForEach((e2) =>
                        {
                            Debug.Log("GoToOptionScene detected");
                            if(LoadFlowScene(i, EntityManager, Entities))
                                PostUpdateCommands.RemoveComponent<GoToOptionsScene>(e2);
                        });
                    }
                    
                    //enable when enums are working correctly
                    //if (flowElement.sceneType == SceneType.Leaderboard)
                    if(flowElement.leaderboard)
                    {
                        Entities.WithAll<GoToLeaderboardScene>().ForEach((e2) =>
                        {
                            Debug.Log("GoToLeaderboardScene detected");
                            if(LoadFlowScene(i, EntityManager, Entities))
                                PostUpdateCommands.RemoveComponent<GoToLeaderboardScene>(e2);
                        });
                    }
                    
                    //enable when enums are working correctly
                    //if (flowElement.sceneType == SceneType.Reward)
                    if(flowElement.reward)
                    {
                        Entities.WithAll<GoToRewardScene>().ForEach((e2) =>
                        {
                            Debug.Log("GoToRewardScene detected");
                            if(LoadFlowScene(i, EntityManager, Entities))
                                PostUpdateCommands.RemoveComponent<GoToRewardScene>(e2);
                        });
                    }
                }
                

                Entities.ForEach((Entity e2, ref SkipInFlow skipAt) =>
                {
                    Debug.Log("SkipInFlow detected");
                    var flowElement = flowBuffer[skipAt.index];
                    flowElement.disabledInFlow = true;
                    flowBuffer.RemoveAt(skipAt.index);
                    flowBuffer.Insert(skipAt.index, flowElement);
                    PostUpdateCommands.RemoveComponent<SkipInFlow>(e2);
                });
                
                Entities.ForEach((Entity e2, ref IncludeInFlow include) => 
                {
                    Debug.Log("IncludeInFlow detected"); 
                    var flowElement = flowBuffer[include.index];
                    flowElement.disabledInFlow = true;
                    flowBuffer.RemoveAt(include.index);
                    flowBuffer.Insert(include.index, flowElement);
                    PostUpdateCommands.RemoveComponent<IncludeInFlow>(e2);
                });
                
            });

            NativeArray<Entity> goToNextInFlowArray = GetEntityQuery(typeof(GoToNextInFlow)).ToEntityArray(Allocator.Temp);
            if (goToNextInFlowArray.Length > 0)
            {
                Debug.Log("GoToNextInFlow found");
                FlowStatistics flowStatistics = EntityManager.GetComponentData<FlowStatistics>(_flowManagerEntity);
                if(LoadNextInFlow(flowStatistics.currentScene, EntityManager, Entities))
                    foreach (var entity in goToNextInFlowArray)
                    {
                        PostUpdateCommands.RemoveComponent<GoToNextInFlow>(entity);
                    }
            }
            goToNextInFlowArray.Dispose();
            
                
            NativeArray<Entity> goToPreviousInFlowArray = GetEntityQuery(typeof(GoToPreviousInFlow)).ToEntityArray(Allocator.Temp);
            if (goToPreviousInFlowArray.Length > 0)
            {
                Debug.Log("GoToPreviousInFlow found");
                FlowStatistics flowStatistics = EntityManager.GetComponentData<FlowStatistics>(_flowManagerEntity);
                if(LoadPreviousInFlow(flowStatistics.currentScene, EntityManager, Entities))
                    foreach (var entity in goToPreviousInFlowArray)
                    {
                        PostUpdateCommands.RemoveComponent<GoToPreviousInFlow>(entity);
                    }
            }
            goToPreviousInFlowArray.Dispose();
            

            NativeArray<Entity> goToNumberInFlowArray = GetEntityQuery(typeof(GoToNumberInFlow)).ToEntityArray(Allocator.Temp);
            if (goToNumberInFlowArray.Length > 0)
            {
                Debug.Log("GoToNumberInFlow found");
                GoToNumberInFlow goToNumberInFlow = EntityManager.GetComponentData<GoToNumberInFlow>(goToNumberInFlowArray[0]);
                if (LoadFlowScene(goToNumberInFlow.flowNumber, EntityManager, Entities))
                {
                    Debug.Log("loaded the flow scene");
                    foreach (var entity in goToNumberInFlowArray)
                    {
                        PostUpdateCommands.RemoveComponent<GoToNumberInFlow>(entity);
                    }
                }
            }
            goToNumberInFlowArray.Dispose();
        }

        public static void Init(EntityManager entityManager)
        {
            GoToNumberInFlow(entityManager, 0);
        }
        
        /// <summary>
        /// Creates a component to tell the update to load the next scene in the flow
        /// </summary>
        /// <param name="entityManager">A reference to the entitymanager instance</param>
        public static void NextInFlow(EntityManager entityManager)
        {
            entityManager.AddComponent(_flowManagerEntity, typeof(GoToNextInFlow));
        }

        /// <summary>
        /// Creates a component to tell the update to load the previous scene in the flow
        /// </summary>
        /// <param name="entityManager">A reference to the entitymanager instance</param>
        public static void PreviousInFlow(EntityManager entityManager)
        {
            entityManager.AddComponent(_flowManagerEntity, typeof(GoToPreviousInFlow));
        }

        /// <summary>
        /// Creates a component to tell the update to load a certain scene in the flow
        /// </summary>
        /// <param name="entityManager">A reference to the entitymanager instance</param>
        /// <param name="indexToGoTo">The index of the scene in the flow to go to</param>
        public static void GoToNumberInFlow(EntityManager entityManager, int indexToGoTo)
        {
            Debug.Log("Go To Number In FLow");
            entityManager.AddComponent(_flowManagerEntity, typeof(GoToNumberInFlow));
            var temp = entityManager.GetComponentData<GoToNumberInFlow>(_flowManagerEntity);
            temp.flowNumber = indexToGoTo;
            entityManager.SetComponentData(_flowManagerEntity, temp);
            Debug.Log("component added");
        }

        /// <summary>
        /// Creates a component to tell the update to mark a certain scene skippable
        /// </summary>
        /// <param name="entityManager">A reference to the entitymanager instance</param>
        /// <param name="indexToSkip">The index in the flow to mark</param>
        public static void DisableScene(EntityManager entityManager, int indexToSkip)
        {
            entityManager.AddComponent(_flowManagerEntity, typeof(SkipInFlow));
            var temp = entityManager.GetComponentData<SkipInFlow>(_flowManagerEntity);
            temp.index = indexToSkip;
            entityManager.SetComponentData(_flowManagerEntity, temp);
        }

        /// <summary>
        /// Creates a component to tell the update to mark a certain scene no longer skippable
        /// </summary>
        /// <param name="entityManager">A reference to the entitymanager instance</param>
        /// <param name="indexToInclude">The index in the flow to mark</param>
        public static void EnableScene(EntityManager entityManager, int indexToInclude)
        {
            entityManager.AddComponent(_flowManagerEntity, typeof(IncludeInFlow));
            var temp = entityManager.GetComponentData<IncludeInFlow>(_flowManagerEntity);
            temp.index = indexToInclude;
            entityManager.SetComponentData(_flowManagerEntity, temp);
        }

        /// <summary>
        /// Creates a component to tell the update to mark the login scene skippable or no longer skippable
        /// </summary>
        /// <param name="entityManager">A reference to the entitymanager instance</param>
        /// <param name="login">Marks for login (true) or logout (false)</param>
        public static void ToggleLogin(EntityManager entityManager, bool login)
        {
            entityManager.AddComponent(_flowManagerEntity, login ? typeof(LoggedIn) : typeof(LoggedOut));
        }
        
        
        /// <summary>
        /// Loads the scene at the given index
        /// </summary>
        /// <param name="numberInFlow">The index of the scene you want to load</param>
        /// <param name="entityManager">A reference to the entitymanager instance</param>
        /// <param name="entities">A reference to the entityQueryBuilder instance</param>
        /// <returns>A bool to mark the succesfull scene loading</returns>
        /// <exception cref="TriedToLoadDisabledSceneException">When you try to load a disabled scene</exception>
        private static bool LoadFlowScene(int numberInFlow, EntityManager entityManager, EntityQueryBuilder entities)
        {
            try
            {
                bool loadedScene = false;
                
                if (_flow[numberInFlow].disabledInFlow)  throw new TriedToLoadDisabledSceneException();

                loadedScene = SceneHandlerSystem.NextScene(_flow[numberInFlow].flowScene, entityManager, entities, false);
                
                if (loadedScene)
                {
                    entities.ForEach((ref FlowStatistics stats) => { stats.currentScene = numberInFlow; });
                }

                return loadedScene;
            }
            catch (Exception e)
            {
                Debug.Log(e.ToString());
            }
            return false;
        }

        /// <summary>
        /// Try to load the next scene in the flow
        /// </summary>
        /// <param name="numberInFlow">The index of the scene you want to find the next scene from</param>
        /// <param name="entityManager">A reference to the entitymanager instance</param>
        /// <param name="entities">A reference to the entityQueryBuilder instance</param>
        /// <returns>A bool to mark the succesfull scene loading</returns>
        /// <exception cref="NoEnabledSceneFoundException">When no enabled scene is found next in the flow</exception>
        private static bool LoadNextInFlow(int numberInFlow, EntityManager entityManager, EntityQueryBuilder entities)
        {
            for (int i = (numberInFlow+1); i < _flow.Length; i++)
            {
                if (!_flow[i].disabledInFlow)
                    return LoadFlowScene(i, entityManager, entities);
            }
            
            throw new NoEnabledSceneFoundException("GoToNextSceneInFlow");
        }
        
        /// <summary>
        /// Try to load the previous scene in the flow
        /// </summary>
        /// <param name="numberInFlow">The index of the scene you want to find the previous scene from</param>
        /// <param name="entityManager">A reference to the entitymanager instance</param>
        /// <param name="entities">A reference to the entityQueryBuilder instance</param>
        /// <returns>A bool to mark the succesfull scene loading</returns>
        /// <exception cref="NoEnabledSceneFoundException">When no enabled scene is found previous in the flow</exception>
        private static bool LoadPreviousInFlow(int numberInFlow, EntityManager entityManager, EntityQueryBuilder entities){
            for (int i = (numberInFlow-1); i >= 0; i--)
            {
                if (!_flow[i].disabledInFlow)
                    return LoadFlowScene(i, entityManager, entities);
            }
            
            throw new NoEnabledSceneFoundException("GoToPreviousSceneInFlow");
        }

        /// <summary>
        /// Returns the current flow index
        /// </summary>
        /// <returns></returns>
        public static int GetCurrentFlowScene(EntityManager entityManager)
        {
            return entityManager.GetComponentData<FlowStatistics>(_flowManagerEntity).currentScene;
        }
    }
    
    
    
}