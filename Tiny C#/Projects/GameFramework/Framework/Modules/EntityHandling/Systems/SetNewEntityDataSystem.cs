using System;
using Modules.Spawner;
using Unity.Entities;
using Unity.Tiny.Core2D;
using UnityEngine;

namespace Modules.EntityHandling
{
    public class SetNewEntityDataSystem : ComponentSystem
    {
        /// <summary>
        /// Updates all new entity positions after scene loading
        /// </summary>
        protected override void OnUpdate()
        {
            Entities.ForEach((Entity e, ref IsNewEntity newEntity, ref Translation t) => 
            {
                switch (newEntity.translationType)
                {
                    case TranslationType.Position:
                        t.Value.x = newEntity.pos.x;
                        t.Value.y = newEntity.pos.y;
                        break;
                    case TranslationType.Offset:
                        t.Value.x += newEntity.offset.x;
                        t.Value.y += newEntity.offset.y;
                        break;
                    case TranslationType.PositionAndOffset:
                        t.Value.x = newEntity.pos.x;
                        t.Value.y = newEntity.pos.y;
                        t.Value.x += newEntity.offset.x;
                        t.Value.y += newEntity.offset.y;
                        break;
                    case TranslationType.None:
                        break;
                    default:
                        break;
                }
                Debug.Log("POSITION: " + t.Value);

                PostUpdateCommands.RemoveComponent<IsNewEntity>(e);
            });
        }
    }
}

