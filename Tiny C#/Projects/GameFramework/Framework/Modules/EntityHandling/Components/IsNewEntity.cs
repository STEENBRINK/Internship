using Modules.Spawner;
using Unity.Authoring.Core;
using Unity.Entities;
using Unity.Mathematics;

namespace Modules.EntityHandling
{
    [HideInInspector]
    public struct IsNewEntity: IComponentData
    {
        public float2 pos;
        public float2 offset;
        public TranslationType translationType;
    }
}