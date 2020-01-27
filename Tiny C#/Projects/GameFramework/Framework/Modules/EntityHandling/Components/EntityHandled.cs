using Unity.Authoring.Core;
using Unity.Entities;

namespace Modules.EntityHandling
{
    [HideInInspector]
    public struct EntityHandled : IComponentData
    {
        public Entity scene;
    }
}