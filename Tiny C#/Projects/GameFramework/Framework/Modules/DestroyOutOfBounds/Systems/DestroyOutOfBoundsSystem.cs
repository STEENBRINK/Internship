using System;
using Modules.SceneHandling;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Tiny.Core2D;
using Unity.Tiny.HitBox2D;
using UnityEngine;

namespace Modules.DestroyOutOfBounds
{
    /// <summary>
    /// Checks for a MaxBounds component and then an AspectRatio component, if both are not found, throws exception
    /// Checks for DestroyWhenOutOfBounds or DestroyAllWhenOutOfBounds components and destroys out of bounds entities based on sprites, hitboxes or just position
    /// </summary>
    public class DestroyOutOfBoundsSystem : ComponentSystem
    {
        private static float2 _maxBoundsPos;
        private static float2 _maxBoundsSize;
        protected override void OnUpdate()
        {
            NativeArray<Entity> maxBoundsArray = GetEntityQuery(typeof(MaxBounds)).ToEntityArray(Allocator.Temp);
            NativeArray<Entity> aspectArray = GetEntityQuery(typeof(AspectRatio)).ToEntityArray(Allocator.Temp);
            if (maxBoundsArray.Length > 0)
            {
                Entities.ForEach((Entity e, ref MaxBounds maxBounds) =>
                {
                    _maxBoundsPos = maxBounds.maxBoundsCenterPos;
                    _maxBoundsSize = maxBounds.maxBoundsSize;
                });
            }
            else
            {
                if (aspectArray.Length > 0)
                {
                    var aspectRatio = EntityManager.GetComponentData<AspectRatio>(aspectArray[0]).aspecratio;
                    Entities.ForEach((Entity e, ref Camera2D camera2D, ref Translation translation) =>
                    {
                        _maxBoundsPos.x = translation.Value.x;
                        _maxBoundsPos.y = translation.Value.y;
                        _maxBoundsSize.y = 2 * camera2D.halfVerticalSize;
                        _maxBoundsSize.x = (2 * camera2D.halfVerticalSize) * (aspectRatio.x/aspectRatio.y);
                    });
                }
                else
                {
                    throw new NoAspectRatioSetException();
                }
            }
            
            
            Entities.WithAll(typeof(DestroyWhenOutOfBounds)).ForEach((Entity entity, ref Translation translation) =>
            {
                if (EntityManager.HasComponent<Sprite2DRendererOptions>(entity))
                {
                    var hitbox = EntityManager.GetComponentData<Sprite2DRendererOptions>(entity).size;
                    if (IsOutOfBounds(translation, hitbox))
                        PostUpdateCommands.DestroyEntity(entity);
                }
                else if(EntityManager.HasComponent<RectHitBox2D>(entity))
                {
                    var hitbox = EntityManager.GetComponentData<RectHitBox2D>(entity).box;
                    if (IsOutOfBounds(translation, hitbox.Size))
                        PostUpdateCommands.DestroyEntity(entity);
                }
                else
                {
                    if(IsOutOfBounds(translation))
                        PostUpdateCommands.DestroyEntity(entity);
                }
            });
            
            Entities.WithAll(typeof(DestroyAllWhenOutOfBounds)).ForEach((entity) =>
            {
                Entities.ForEach((Entity e, ref Translation translation) =>
                {
                    try
                    {
                        if (EntityManager.HasComponent<DoNotDestroyWhenOutOfBounds>(e)) return;
                        if (EntityManager.HasComponent<Sprite2DRendererOptions>(e))
                        {
                            var hitbox = EntityManager.GetComponentData<Sprite2DRendererOptions>(e).size;
                            if (IsOutOfBounds(translation, hitbox))
                                PostUpdateCommands.DestroyEntity(e);
                        }
                        else if (EntityManager.HasComponent<RectHitBox2D>(e))
                        {
                            var hitbox = EntityManager.GetComponentData<RectHitBox2D>(e).box;
                            if (IsOutOfBounds(translation, hitbox.Size))
                                PostUpdateCommands.DestroyEntity(e);
                        }
                        else
                        {
                            if (IsOutOfBounds(translation))
                                PostUpdateCommands.DestroyEntity(e);
                        }
                    }
                    catch (Exception exception)
                    {
                        Debug.Log(exception.ToString());
                    }
                });
            });
            
            Entities.WithAll(typeof(UnloadWhenOutOfBounds)).ForEach((Entity entity, ref Translation translation) =>
            {
                if (EntityManager.HasComponent<Sprite2DRendererOptions>(entity))
                {
                    var hitbox = EntityManager.GetComponentData<Sprite2DRendererOptions>(entity).size;
                    if (IsOutOfBounds(translation, hitbox))
                        SceneHandlerSystem.MarkSceneForUnload(EntityManager, Entities, SceneHandlerSystem.GetSceneFromEntityHandled(EntityManager, entity));
                }
                else if(EntityManager.HasComponent<RectHitBox2D>(entity))
                {
                    var hitbox = EntityManager.GetComponentData<RectHitBox2D>(entity).box;
                    if (IsOutOfBounds(translation, hitbox.Size))
                        SceneHandlerSystem.MarkSceneForUnload(EntityManager, Entities, SceneHandlerSystem.GetSceneFromEntityHandled(EntityManager, entity));
                }
                else
                {
                    if(IsOutOfBounds(translation))
                        SceneHandlerSystem.MarkSceneForUnload(EntityManager, Entities, SceneHandlerSystem.GetSceneFromEntityHandled(EntityManager, entity));
                }
            });
            
            Entities.WithAll(typeof(UnloadAllWhenOutOfBounds)).ForEach((entity) =>
            {
                Entities.ForEach((Entity e, ref Translation translation) =>
                {
                    try
                    {
                        if (EntityManager.HasComponent<DoNotUnloadWhenOutOfBounds>(e)) return;
                        if (EntityManager.HasComponent<Sprite2DRendererOptions>(e))
                        {
                            var hitbox = EntityManager.GetComponentData<Sprite2DRendererOptions>(e).size;
                            if (IsOutOfBounds(translation, hitbox))
                                SceneHandlerSystem.MarkSceneForUnload(EntityManager, Entities,
                                    SceneHandlerSystem.GetSceneFromEntityHandled(EntityManager, e));

                        }
                        else if (EntityManager.HasComponent<RectHitBox2D>(e))
                        {
                            var hitbox = EntityManager.GetComponentData<RectHitBox2D>(e).box;
                            if (IsOutOfBounds(translation, hitbox.Size))
                                SceneHandlerSystem.MarkSceneForUnload(EntityManager, Entities,
                                    SceneHandlerSystem.GetSceneFromEntityHandled(EntityManager, e));
                        }
                        else
                        {
                            if (IsOutOfBounds(translation))
                                SceneHandlerSystem.MarkSceneForUnload(EntityManager, Entities,
                                    SceneHandlerSystem.GetSceneFromEntityHandled(EntityManager, e));
                        }
                    }
                    catch (Exception exception)
                    {
                        Debug.Log(exception.ToString());
                    }
                });
            });
        }

        /// <summary>
        /// Checks if the object is out of bounds on a margin of 5
        /// </summary>
        /// <param name="pos">The position of the object</param>
        /// <returns>weather or not the object is out of bounds</returns>
        private static bool IsOutOfBounds(Translation pos)
        {
            return ((pos.Value.x + 5) < (_maxBoundsPos.x - _maxBoundsSize.x/2) ||
                    (pos.Value.x - 5) > (_maxBoundsPos.x + _maxBoundsSize.x/2) ||
                    (pos.Value.y + 5) < (_maxBoundsPos.y - _maxBoundsSize.x/2) ||
                    (pos.Value.y - 5) > (_maxBoundsPos.y + _maxBoundsSize.x/2));
        }

        /// <summary>
        /// Checks if the object is out of bounds with its box and position
        /// </summary>
        /// <param name="pos">The position of the object</param>
        /// <param name="box">The size of the object</param>
        /// <returns>weather or not the object is out of bounds</returns>
        private static bool IsOutOfBounds(Translation pos, float2 box)
        {
            return ((pos.Value.x + box.x/2) < (_maxBoundsPos.x - _maxBoundsSize.x/2) ||
                    (pos.Value.x - box.x/2) > (_maxBoundsPos.x + _maxBoundsSize.x/2) ||
                    (pos.Value.y + box.y/2) < (_maxBoundsPos.y - _maxBoundsSize.x/2) ||
                    (pos.Value.y - box.y/2) > (_maxBoundsPos.y + _maxBoundsSize.x/2));
        }
    }
}
